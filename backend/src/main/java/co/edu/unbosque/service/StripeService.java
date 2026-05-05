package co.edu.unbosque.service;

import co.edu.unbosque.dto.CheckoutRequest;
import co.edu.unbosque.dto.PaymentIntentResponse;
import co.edu.unbosque.entity.Entrada;
import co.edu.unbosque.entity.Partido;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.EntradaRepository;
import co.edu.unbosque.repository.PartidoRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.model.StripeObject;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class StripeService {

    // ── Precios en centavos de USD ────────────────────────────────────────────
    public static final Map<String, Long> PRECIOS_CENTAVOS = Map.of(
            "GENERAL",  8_000L,  // $80.00
            "VIP",     25_000L,  // $250.00
            "PALCO",   50_000L   // $500.00
    );

    public static final Map<String, BigDecimal> PRECIOS_USD = Map.of(
            "GENERAL", new BigDecimal("80.00"),
            "VIP",     new BigDecimal("250.00"),
            "PALCO",   new BigDecimal("500.00")
    );

    @Value("${stripe.secret.key}")
    private String secretKey;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    private final EntradaRepository entradaRepository;
    private final PartidoRepository  partidoRepository;
    private final FcmService         fcmService;

    public StripeService(EntradaRepository entradaRepository,
                         PartidoRepository partidoRepository,
                         FcmService fcmService) {
        this.entradaRepository = entradaRepository;
        this.partidoRepository  = partidoRepository;
        this.fcmService         = fcmService;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
        if (secretKey.contains("REEMPLAZA")) {
            log.warn("⚠️  Stripe API key not configured. Set STRIPE_SECRET_KEY env var.");
        } else {
            log.info("✅ Stripe initialized (sandbox mode)");
        }
    }

    // ── Checkout ──────────────────────────────────────────────────────────────

    @Transactional
    public PaymentIntentResponse crearCheckout(CheckoutRequest req, Usuario usuario) {

        if (secretKey.contains("REEMPLAZA")) {
            throw new IllegalStateException("Stripe no está configurado. Agrega STRIPE_SECRET_KEY al entorno.");
        }

        String categoria = req.getCategoria().toUpperCase();
        if (!PRECIOS_CENTAVOS.containsKey(categoria)) {
            throw new IllegalArgumentException("Categoría inválida: " + categoria + ". Use GENERAL, VIP o PALCO.");
        }

        Partido partido = partidoRepository.findById(req.getPartidoId())
                .orElseThrow(() -> new IllegalArgumentException("Partido no encontrado: " + req.getPartidoId()));

        long precioPorEntrada = PRECIOS_CENTAVOS.get(categoria);
        long totalCentavos    = precioPorEntrada * req.getCantidad();
        BigDecimal precioUnit = PRECIOS_USD.get(categoria);
        BigDecimal totalUsd   = precioUnit.multiply(new BigDecimal(req.getCantidad()));

        String email = req.getEmailComprador() != null ? req.getEmailComprador()
                     : (usuario != null ? usuario.getEmail() : "guest@mundial2026.com");

        // Crear PaymentIntent en Stripe
        PaymentIntent pi;
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(totalCentavos)
                    .setCurrency("usd")
                    .setReceiptEmail(email)
                    .putMetadata("partidoId",  String.valueOf(partido.getId()))
                    .putMetadata("categoria",  categoria)
                    .putMetadata("cantidad",   String.valueOf(req.getCantidad()))
                    .putMetadata("usuarioId",  usuario != null ? String.valueOf(usuario.getId()) : "guest")
                    .setDescription("WC 2026 — " + partido.getSeleccionLocal().getPais()
                                    + " vs " + partido.getSeleccionVisitante().getPais()
                                    + " · " + categoria + " x" + req.getCantidad())
                    .build();
            pi = PaymentIntent.create(params);
            log.info("💳 PaymentIntent created: {} — {} USD", pi.getId(), totalUsd);
        } catch (StripeException e) {
            log.error("❌ Stripe error: {}", e.getMessage());
            throw new RuntimeException("Error al crear el pago: " + e.getMessage());
        }

        // Persistir entradas con estado PENDIENTE
        List<Integer> ids = new ArrayList<>();
        for (int i = 0; i < req.getCantidad(); i++) {
            Entrada e = Entrada.builder()
                    .codigoQr(UUID.randomUUID().toString().toUpperCase().replace("-", ""))
                    .categoria(categoria)
                    .precio(precioUnit)
                    .estado("PENDIENTE")
                    .stripePaymentIntentId(pi.getId())
                    .stripeStatus("requires_payment_method")
                    .cantidad(1)
                    .total(precioUnit)
                    .fechaCompra(LocalDateTime.now())
                    .emailComprador(email)
                    .partido(partido)
                    .usuarioComprador(usuario)
                    .build();
            ids.add(entradaRepository.save(e).getId());
        }

        String desc = partido.getSeleccionLocal().getPais()
                    + " vs " + partido.getSeleccionVisitante().getPais()
                    + " — " + partido.getRonda();

        return PaymentIntentResponse.builder()
                .clientSecret(pi.getClientSecret())
                .paymentIntentId(pi.getId())
                .totalUsd(totalUsd)
                .cantidad(req.getCantidad())
                .categoria(categoria)
                .entradaIds(ids)
                .partidoDescripcion(desc)
                .build();
    }

    // ── Webhook ───────────────────────────────────────────────────────────────

    @Transactional
    public void procesarWebhook(String payload, String sigHeader) {
        Event event;
        try {
            if (webhookSecret.contains("REEMPLAZA")) {
                // Skip signature check in dev
                event = Event.GSON.fromJson(payload, Event.class);
            } else {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            }
        } catch (SignatureVerificationException e) {
            throw new SecurityException("Invalid Stripe signature");
        }

        log.info("📩 Stripe webhook: {}", event.getType());

        Optional<StripeObject> stripeObjectOpt = event.getDataObjectDeserializer().getObject();
        switch (event.getType()) {
            case "payment_intent.succeeded" -> stripeObjectOpt.ifPresent(obj -> {
                PaymentIntent pi2 = (PaymentIntent) obj;
                manejarPagoExitoso(pi2.getId());
            });
            case "payment_intent.payment_failed" -> stripeObjectOpt.ifPresent(obj -> {
                PaymentIntent pi2 = (PaymentIntent) obj;
                manejarPagoFallido(pi2.getId());
            });
            default -> log.debug("Evento ignorado: {}", event.getType());
        }
    }

    private void manejarPagoExitoso(String piId) {
        List<Entrada> entradas = entradaRepository.findByStripePaymentIntentId(piId);
        entradas.forEach(e -> {
            e.setEstado("PAGADO");
            e.setStripeStatus("succeeded");
        });
        entradaRepository.saveAll(entradas);
        log.info("✅ {} entradas marcadas como PAGADO para PI: {}", entradas.size(), piId);

        // FCM — notify the buyer
        if (!entradas.isEmpty()) {
            Entrada primera = entradas.get(0);
            String desc = primera.getPartido() != null
                    ? primera.getPartido().getSeleccionLocal().getPais()
                      + " vs " + primera.getPartido().getSeleccionVisitante().getPais()
                      + " — " + primera.getPartido().getRonda()
                    : "Partido WC 2026";
            fcmService.notifyTicketPurchase(
                    primera.getUsuarioComprador(),
                    desc,
                    primera.getCategoria(),
                    entradas.size());
        }
    }

    private void manejarPagoFallido(String piId) {
        List<Entrada> entradas = entradaRepository.findByStripePaymentIntentId(piId);
        entradas.forEach(e -> {
            e.setEstado("FALLIDO");
            e.setStripeStatus("payment_failed");
        });
        entradaRepository.saveAll(entradas);
        log.warn("❌ {} entradas marcadas como FALLIDO para PI: {}", entradas.size(), piId);
    }
}
