package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoporteService {

    private final IncidenteSoporteRepository incidenteRepository;
    private final LogsTransaccionalRepository logRepository;
    private final NotificacionRepository notificacionRepository;
    private final AliadoComercialRepository aliadoRepository;
    private final ReporteInteraccionAPIRepository reporteAPIRepository;
    private final ReporteComplianceRepository reporteComplianceRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntradaRepository entradaRepository;
    private final EmailService emailService;
    private final TransactionLogService logService;

    // ════════════════════════════════════════════════════════════════════
    //  INCIDENTES
    // ════════════════════════════════════════════════════════════════════

    @Transactional
    public IncidenteResponse crearIncidente(IncidenteRequest request, Integer reportadorId) {
        Usuario reportador = usuarioRepository.findById(reportadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        IncidenteSoporte incidente = IncidenteSoporte.builder()
                .descripcion(request.getDescripcion())
                .estado("ABIERTO")
                .prioridad(request.getPrioridad())
                .reportador(reportador)
                .build();

        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    public List<IncidenteResponse> getIncidentesAbiertos() {
        return incidenteRepository.findByEstado("ABIERTO").stream()
                .map(this::toIncidenteResponse)
                .collect(Collectors.toList());
    }

    public List<IncidenteResponse> getIncidentesByAgente(Integer agenteId) {
        return incidenteRepository.findByAgenteSoporteId(agenteId).stream()
                .map(this::toIncidenteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidenteResponse asignarAgente(Integer incidenteId, Integer agenteId) {
        IncidenteSoporte incidente = incidenteRepository.findById(incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado"));

        Usuario agente = usuarioRepository.findById(agenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Agente no encontrado"));

        incidente.setAgenteSoporte(agente);
        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    @Transactional
    public IncidenteResponse resolverIncidente(Integer incidenteId, String resolucion) {
        IncidenteSoporte incidente = incidenteRepository.findById(incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado"));

        incidente.setEstado("RESUELTO");
        incidente.setDescripcion(incidente.getDescripcion() + "\n\nResolución: " + resolucion);
        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    // ════════════════════════════════════════════════════════════════════
    //  LOGS Y NOTIFICACIONES
    // ════════════════════════════════════════════════════════════════════

    @Transactional
    public LogResponse crearLog(LogRequest request, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String hash = generateHash(request.getAccion() + System.currentTimeMillis());

        LogsTransaccional log = LogsTransaccional.builder()
                .accion(request.getAccion())
                .detalle(request.getDetalle())
                .hashIntegridad(hash)
                .nivelRiesgo(request.getNivelRiesgo() != null ? request.getNivelRiesgo() : "BAJO")
                .verificadoCompliance(false)
                .usuario(usuario)
                .build();

        log = logRepository.save(log);
        return toLogResponse(log);
    }

    public List<LogResponse> getLogsByUsuario(Integer usuarioId) {
        return logRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificacionResponse crearNotificacion(NotificacionRequest request) {
        Usuario destinatario = usuarioRepository.findById(request.getIdDestinatario())
                .orElseThrow(() -> new ResourceNotFoundException("Destinatario no encontrado"));

        Usuario emisor = null;
        if (request.getIdEmisor() != null) {
            emisor = usuarioRepository.findById(request.getIdEmisor()).orElse(null);
        }

        Notificacion notificacion = Notificacion.builder()
                .mensaje(request.getMensaje())
                .canal(request.getCanal())
                .destinatario(destinatario)
                .emisor(emisor)
                .build();

        notificacion = notificacionRepository.save(notificacion);
        return toNotificacionResponse(notificacion);
    }

    public List<NotificacionResponse> getNotificacionesByUsuario(Integer usuarioId) {
        return notificacionRepository.findByDestinatarioId(usuarioId).stream()
                .map(this::toNotificacionResponse)
                .collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════════════
    //  DASHBOARD DE SOPORTE — BÚSQUEDA CENTRALIZADA
    // ════════════════════════════════════════════════════════════════════

    /**
     * Resuelve un aficionado a partir de un ID de aficionado, un correo
     * electrónico o un ID de transacción de boletería (paymentIntentId,
     * ID de entrada o código QR).
     */
    public SoporteBusquedaResponse buscarUsuario(String query) {
        if (query == null || query.isBlank()) {
            throw new BadRequestException("Ingresa un ID de aficionado, correo o ID de transacción");
        }
        Usuario usuario = resolverUsuario(query.trim());
        if (usuario == null) {
            throw new ResourceNotFoundException(
                    "No se encontró ningún aficionado para: " + query.trim());
        }
        return toBusquedaResponse(usuario);
    }

    private Usuario resolverUsuario(String q) {
        // 1. Correo electrónico
        if (q.contains("@")) {
            return usuarioRepository.findByEmail(q).orElse(null);
        }

        // 2. ID de transacción Stripe (prefijo pi_)
        if (q.toLowerCase().startsWith("pi_")) {
            Usuario u = compradorDePaymentIntent(q);
            if (u != null) return u;
        }

        // 3. ID numérico → primero usuario, luego entrada
        try {
            int id = Integer.parseInt(q);
            Optional<Usuario> u = usuarioRepository.findById(id);
            if (u.isPresent()) return u.get();
            Optional<Entrada> e = entradaRepository.findById(id);
            if (e.isPresent() && e.get().getUsuarioComprador() != null) {
                return e.get().getUsuarioComprador();
            }
        } catch (NumberFormatException ignored) {
            // no es numérico — continúa
        }

        // 4. Código QR de entrada
        Optional<Entrada> porQr = entradaRepository.findByCodigoQr(q.toUpperCase());
        if (porQr.isPresent() && porQr.get().getUsuarioComprador() != null) {
            return porQr.get().getUsuarioComprador();
        }

        // 5. paymentIntentId sin prefijo reconocible
        return compradorDePaymentIntent(q);
    }

    private Usuario compradorDePaymentIntent(String piId) {
        return entradaRepository.findByStripePaymentIntentId(piId).stream()
                .map(Entrada::getUsuarioComprador)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private SoporteBusquedaResponse toBusquedaResponse(Usuario u) {
        List<Entrada> entradas = entradaRepository.findByUsuarioCompradorId(u.getId());
        int incidentes = incidenteRepository.findByReportadorId(u.getId()).size();
        int logs = logRepository.findByUsuarioId(u.getId()).size();

        return SoporteBusquedaResponse.builder()
                .usuarioId(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .rol(u.getRol() != null ? u.getRol().getNombre() : null)
                .seleccionFavorita(u.getSeleccionFavorita())
                .zonaHoraria(u.getZonaHoraria())
                .fechaRegistro(u.getFechaRegistro())
                .ultimoLogin(u.getUltimoLogin())
                .totalEntradas(entradas.size())
                .totalIncidentes(incidentes)
                .totalLogs(logs)
                .entradas(entradas.stream()
                        .sorted(Comparator.comparing(Entrada::getId).reversed())
                        .map(this::toEntradaResumen)
                        .collect(Collectors.toList()))
                .build();
    }

    // ════════════════════════════════════════════════════════════════════
    //  DASHBOARD DE SOPORTE — LÍNEA DE TIEMPO
    // ════════════════════════════════════════════════════════════════════

    /**
     * Construye la línea de tiempo cronológica de un aficionado, fusionando
     * logs transaccionales, entradas, notificaciones e incidentes.
     */
    public List<TimelineEventResponse> getTimeline(Integer usuarioId) {
        usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<TimelineEventResponse> eventos = new ArrayList<>();

        // 1. Logs transaccionales (login, reservas, errores, acciones de soporte…)
        for (LogsTransaccional l : logRepository.findByUsuarioId(usuarioId)) {
            eventos.add(TimelineEventResponse.builder()
                    .timestamp(l.getTimestamp())
                    .tipo(tipoDesdeAccion(l.getAccion()))
                    .titulo(humanizar(l.getAccion()))
                    .detalle(l.getDetalle())
                    .correlationId(l.getCorrelationId())
                    .severidad(severidadDesdeAccion(l.getAccion(), l.getNivelRiesgo()))
                    .build());
        }

        // 2. Entradas — un evento snapshot del estado actual de cada boleto
        for (Entrada e : entradaRepository.findByUsuarioCompradorId(usuarioId)) {
            String estado = e.getEstado() != null ? e.getEstado().toUpperCase() : "";
            String partido = describirPartido(e);
            String tipo;
            String titulo;
            String severidad;
            switch (estado) {
                case "FALLIDO" -> {
                    tipo = "PAGO_ERROR";
                    titulo = "Error en pasarela Sandbox — reserva fallida";
                    severidad = "ERROR";
                }
                case "REEMBOLSADO" -> {
                    tipo = "REEMBOLSO";
                    titulo = "Entrada reembolsada";
                    severidad = "WARN";
                }
                case "PAGADO", "USADO" -> {
                    tipo = "PAGO_OK";
                    titulo = "Compra de entrada confirmada";
                    severidad = "INFO";
                }
                default -> {
                    tipo = "RESERVA";
                    titulo = "Reserva de entrada pendiente";
                    severidad = "WARN";
                }
            }
            eventos.add(TimelineEventResponse.builder()
                    .timestamp(e.getFechaCompra())
                    .tipo(tipo)
                    .titulo(titulo + (partido.isBlank() ? "" : " — " + partido))
                    .detalle("Entrada #" + e.getId() + " · " + e.getCategoria()
                            + " · estado: " + e.getEstado()
                            + (e.getStripeStatus() != null ? " (" + e.getStripeStatus() + ")" : ""))
                    .correlationId(e.getStripePaymentIntentId())
                    .severidad(severidad)
                    .referenciaId(e.getId())
                    .build());
        }

        // 3. Notificaciones recibidas
        for (Notificacion n : notificacionRepository.findByDestinatarioId(usuarioId)) {
            eventos.add(TimelineEventResponse.builder()
                    .timestamp(n.getFechaEnvio())
                    .tipo("EMAIL")
                    .titulo("Notificación enviada (" + n.getCanal() + ")")
                    .detalle(n.getMensaje())
                    .severidad("INFO")
                    .referenciaId(n.getId())
                    .build());
        }

        // 4. Incidentes reportados
        for (IncidenteSoporte i : incidenteRepository.findByReportadorId(usuarioId)) {
            eventos.add(TimelineEventResponse.builder()
                    .timestamp(i.getFechaCreacion())
                    .tipo("INCIDENTE")
                    .titulo("Incidente de soporte #" + i.getId() + " — " + i.getEstado())
                    .detalle(i.getDescripcion())
                    .severidad("RESUELTO".equalsIgnoreCase(i.getEstado()) ? "INFO" : "WARN")
                    .referenciaId(i.getId())
                    .build());
        }

        // Orden cronológico ascendente (más antiguo → más reciente)
        eventos.removeIf(ev -> ev.getTimestamp() == null);
        eventos.sort(Comparator.comparing(TimelineEventResponse::getTimestamp));
        return eventos;
    }

    // ════════════════════════════════════════════════════════════════════
    //  DASHBOARD DE SOPORTE — ACCIONES CORRECTIVAS
    // ════════════════════════════════════════════════════════════════════

    /** Reenvía el correo de confirmación de una entrada al comprador. */
    @Transactional
    public Map<String, Object> reenviarConfirmacion(Integer entradaId) {
        Entrada e = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada #" + entradaId + " no encontrada"));

        String email = e.getEmailComprador();
        if ((email == null || email.isBlank()) && e.getUsuarioComprador() != null) {
            email = e.getUsuarioComprador().getEmail();
        }
        if (email == null || email.isBlank()) {
            throw new BadRequestException("La entrada #" + entradaId + " no tiene un correo asociado");
        }

        emailService.sendTicketConfirmationEmail(
                email, e.getCodigoQr(), describirPartido(e), e.getCategoria());

        logService.registrar(e.getUsuarioComprador(), "REENVIO_CONFIRMACION",
                "Soporte reenvió la confirmación de la entrada #" + e.getId() + " a " + email,
                "MEDIO", e.getStripePaymentIntentId());

        return Map.of(
                "entradaId", e.getId(),
                "email", email,
                "mensaje", "Correo de confirmación reenviado a " + email);
    }

    /** Reactiva una reserva que el sistema liberó por error (FALLIDO/PENDIENTE → PAGADO). */
    @Transactional
    public Map<String, Object> reactivarReserva(Integer entradaId) {
        Entrada e = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada #" + entradaId + " no encontrada"));

        String estadoAnterior = e.getEstado() != null ? e.getEstado().toUpperCase() : "";
        if ("PAGADO".equals(estadoAnterior)) {
            throw new BadRequestException("La entrada #" + entradaId + " ya está activa (PAGADO)");
        }
        if ("USADO".equals(estadoAnterior)) {
            throw new BadRequestException("La entrada #" + entradaId + " ya fue usada y no puede reactivarse");
        }

        e.setEstado("PAGADO");
        e.setStripeStatus("succeeded");
        entradaRepository.save(e);

        logService.registrar(e.getUsuarioComprador(), "REACTIVACION_RESERVA",
                "Soporte reactivó la entrada #" + e.getId()
                        + " (" + estadoAnterior + " → PAGADO)",
                "ALTO", e.getStripePaymentIntentId());

        return Map.of(
                "entradaId", e.getId(),
                "estadoAnterior", estadoAnterior,
                "estadoNuevo", "PAGADO",
                "mensaje", "Reserva #" + e.getId() + " reactivada correctamente");
    }

    /** Procesa un reembolso simulado de la pasarela sandbox (→ REEMBOLSADO). */
    @Transactional
    public Map<String, Object> procesarReembolso(Integer entradaId) {
        Entrada e = entradaRepository.findById(entradaId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada #" + entradaId + " no encontrada"));

        String estadoAnterior = e.getEstado() != null ? e.getEstado().toUpperCase() : "";
        if ("REEMBOLSADO".equals(estadoAnterior)) {
            throw new BadRequestException("La entrada #" + entradaId + " ya fue reembolsada");
        }

        BigDecimal monto = e.getTotal() != null ? e.getTotal() : e.getPrecio();
        e.setEstado("REEMBOLSADO");
        e.setStripeStatus("refunded");
        entradaRepository.save(e);

        logService.registrar(e.getUsuarioComprador(), "REEMBOLSO_SIMULADO",
                "Soporte procesó un reembolso simulado de la entrada #" + e.getId()
                        + " por " + monto + " USD (" + estadoAnterior + " → REEMBOLSADO)",
                "ALTO", e.getStripePaymentIntentId());

        return Map.of(
                "entradaId", e.getId(),
                "estadoAnterior", estadoAnterior,
                "estadoNuevo", "REEMBOLSADO",
                "monto", monto,
                "mensaje", "Reembolso simulado de " + monto + " USD procesado para la entrada #" + e.getId());
    }

    // ════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ════════════════════════════════════════════════════════════════════

    private String describirPartido(Entrada e) {
        if (e.getSeleccionLocal() == null || e.getSeleccionVisitante() == null) return "";
        String desc = e.getSeleccionLocal() + " vs " + e.getSeleccionVisitante();
        if (e.getRonda() != null) desc += " — " + e.getRonda();
        return desc;
    }

    private String tipoDesdeAccion(String accion) {
        if (accion == null) return "GENERICO";
        String a = accion.toUpperCase();
        if (a.contains("SESION") || a.contains("LOGIN")) return "LOGIN";
        if (a.contains("ERROR") || a.contains("PASARELA")) return "PAGO_ERROR";
        if (a.contains("REEMBOLSO")) return "REEMBOLSO";
        if (a.contains("REACTIVA")) return "ACCION_SOPORTE";
        if (a.contains("CONFIRMACION") || a.contains("REENVIO")) return "EMAIL";
        if (a.contains("RESERVA")) return "RESERVA";
        if (a.contains("PAGO")) return "PAGO_OK";
        return "GENERICO";
    }

    private String humanizar(String accion) {
        if (accion == null || accion.isBlank()) return "Evento del sistema";
        return switch (accion.toUpperCase()) {
            case "INICIO_SESION" -> "Usuario inició sesión";
            case "RESERVA_ENTRADA" -> "Intento de reserva de entrada";
            case "PAGO_EXITOSO" -> "Pago confirmado";
            case "ERROR_PASARELA" -> "Error en pasarela Sandbox";
            case "REENVIO_CONFIRMACION" -> "Reenvío de confirmación de entrada";
            case "REACTIVACION_RESERVA" -> "Reserva reactivada por soporte";
            case "REEMBOLSO_SIMULADO" -> "Reembolso simulado procesado";
            default -> {
                String base = accion.replace('_', ' ').toLowerCase();
                yield Character.toUpperCase(base.charAt(0)) + base.substring(1);
            }
        };
    }

    private String severidadDesdeAccion(String accion, String nivelRiesgo) {
        String a = accion == null ? "" : accion.toUpperCase();
        if (a.contains("ERROR") || a.contains("PASARELA")) return "ERROR";
        if ("ALTO".equalsIgnoreCase(nivelRiesgo)) return "WARN";
        return "INFO";
    }

    private String generateHash(String data) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(data.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "HASH_ERROR";
        }
    }

    private SoporteEntradaResumen toEntradaResumen(Entrada e) {
        return SoporteEntradaResumen.builder()
                .entradaId(e.getId())
                .codigoQr(e.getCodigoQr())
                .partido(describirPartido(e))
                .categoria(e.getCategoria())
                .estado(e.getEstado())
                .stripeStatus(e.getStripeStatus())
                .stripePaymentIntentId(e.getStripePaymentIntentId())
                .emailComprador(e.getEmailComprador())
                .total(e.getTotal() != null ? e.getTotal() : e.getPrecio())
                .fechaCompra(e.getFechaCompra())
                .build();
    }

    private IncidenteResponse toIncidenteResponse(IncidenteSoporte i) {
        return IncidenteResponse.builder()
                .id(i.getId())
                .descripcion(i.getDescripcion())
                .estado(i.getEstado())
                .prioridad(i.getPrioridad())
                .idReportador(i.getReportador().getId())
                .nombreReportador(i.getReportador().getNombre())
                .idAgente(i.getAgenteSoporte() != null ? i.getAgenteSoporte().getId() : null)
                .fechaCreacion(i.getFechaCreacion())
                .build();
    }

    private LogResponse toLogResponse(LogsTransaccional l) {
        return LogResponse.builder()
                .id(l.getId())
                .accion(l.getAccion())
                .timestamp(l.getTimestamp())
                .detalle(l.getDetalle())
                .hashIntegridad(l.getHashIntegridad())
                .nivelRiesgo(l.getNivelRiesgo())
                .correlationId(l.getCorrelationId())
                .verificadoCompliance(l.getVerificadoCompliance())
                .build();
    }

    private NotificacionResponse toNotificacionResponse(Notificacion n) {
        return NotificacionResponse.builder()
                .id(n.getId())
                .mensaje(n.getMensaje())
                .canal(n.getCanal())
                .idDestinatario(n.getDestinatario().getId())
                .idEmisor(n.getEmisor() != null ? n.getEmisor().getId() : null)
                .fechaEnvio(n.getFechaEnvio())
                .build();
    }
}
