package co.edu.unbosque.controller;

import co.edu.unbosque.dto.CheckoutRequest;
import co.edu.unbosque.dto.PaymentIntentResponse;
import co.edu.unbosque.entity.Entrada;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.EntradaRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.service.StripeService;
import java.util.Objects;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/entradas")
@RequiredArgsConstructor
@Slf4j
public class EntradaController {

    private final StripeService      stripeService;
    private final EntradaRepository  entradaRepository;
    private final UsuarioRepository  usuarioRepository;

    // ── Precios públicos ──────────────────────────────────────────────────────

    @GetMapping("/precios")
    public ResponseEntity<?> getPrecios() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "GENERAL", Map.of("usd", 80,  "label", "General"),
                        "VIP",     Map.of("usd", 250, "label", "VIP"),
                        "PALCO",   Map.of("usd", 500, "label", "Palco")
                )
        ));
    }

    // ── Crear checkout (crea PaymentIntent en Stripe) ─────────────────────────

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @Valid @RequestBody CheckoutRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername()).orElse(null);

        try {
            PaymentIntentResponse response = stripeService.crearCheckout(req, usuario);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(503).body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Checkout error: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("success", false, "message", "Error al procesar el pago: " + e.getMessage()));
        }
    }

    // ── Webhook Stripe (público, sin JWT) ─────────────────────────────────────

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            stripeService.procesarWebhook(payload, sigHeader != null ? sigHeader : "");
            return ResponseEntity.ok("ok");
        } catch (SecurityException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("error");
        }
    }

    // ── Mis entradas (usuario autenticado) ────────────────────────────────────

    @GetMapping("/mis-entradas")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMisEntradas(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (usuario == null) return ResponseEntity.ok(Map.of("success", true, "data", List.of()));

        List<Entrada> entradas = entradaRepository.findByUsuarioCompradorId(usuario.getId());
        List<Map<String, Object>> result = entradas.stream()
                .map(e -> {
                    String matchDesc = "";
                    if (e.getSeleccionLocal() != null && e.getSeleccionVisitante() != null) {
                        matchDesc = e.getSeleccionLocal() + " vs " + e.getSeleccionVisitante();
                        if (e.getRonda() != null) matchDesc += " — " + e.getRonda();
                    }
                    return Map.<String, Object>of(
                            "id",          e.getId(),
                            "codigoQr",    e.getCodigoQr(),
                            "categoria",   e.getCategoria(),
                            "precio",      e.getPrecio(),
                            "estado",      e.getEstado(),
                            "stripeId",    Objects.requireNonNullElse(e.getStripePaymentIntentId(), ""),
                            "fechaCompra", e.getFechaCompra() != null ? e.getFechaCompra().toString() : "",
                            "partido",     matchDesc
                    );
                })
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }
}
