package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.SoporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/soporte")
@RequiredArgsConstructor
public class SoporteController {

    private final SoporteService soporteService;

    @PostMapping("/incidentes")
    public ResponseEntity<ApiResponse<IncidenteResponse>> crearIncidente(
            @RequestBody IncidenteRequest request,
            @RequestParam Integer reportadorId) {
        IncidenteResponse incidente = soporteService.crearIncidente(request, reportadorId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(incidente, "Incidente creado"));
    }

    @GetMapping("/incidentes")
    public ResponseEntity<ApiResponse<List<IncidenteResponse>>> getIncidentesAbiertos() {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getIncidentesAbiertos(), "Incidentes abiertos"));
    }

    @GetMapping("/incidentes/agente/{agenteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<List<IncidenteResponse>>> getIncidentesByAgente(@PathVariable Integer agenteId) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getIncidentesByAgente(agenteId), "Incidentes del agente"));
    }

    @PutMapping("/incidentes/{id}/asignar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<IncidenteResponse>> asignarAgente(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.asignarAgente(id, body.get("agenteId")), "Agente asignado"));
    }

    @PutMapping("/incidentes/{id}/resolver")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<IncidenteResponse>> resolverIncidente(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.resolverIncidente(id, body.get("resolucion")), "Incidente resuelto"));
    }

    @PostMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<LogResponse>> crearLog(
            @RequestBody LogRequest request,
            @RequestParam Integer usuarioId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(soporteService.crearLog(request, usuarioId), "Log creado"));
    }

    @GetMapping("/logs/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<List<LogResponse>>> getLogs(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getLogsByUsuario(usuarioId), "Logs"));
    }

    @PostMapping("/notificaciones")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<NotificacionResponse>> crearNotificacion(@RequestBody NotificacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(soporteService.crearNotificacion(request), "Notificación enviada"));
    }

    @GetMapping("/notificaciones/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<List<NotificacionResponse>>> getNotificaciones(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getNotificacionesByUsuario(usuarioId), "Notificaciones"));
    }

    // ════════════════════════════════════════════════════════════════════
    //  DASHBOARD DE SOPORTE — buscador, línea de tiempo y acciones
    // ════════════════════════════════════════════════════════════════════

    /** Buscador centralizado: ID de aficionado, correo o ID de transacción. */
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<SoporteBusquedaResponse>> buscar(@RequestParam("q") String q) {
        return ResponseEntity.ok(ApiResponse.success(
                soporteService.buscarUsuario(q), "Aficionado encontrado"));
    }

    /** Línea de tiempo cronológica de un aficionado. */
    @GetMapping("/timeline/{usuarioId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<List<TimelineEventResponse>>> timeline(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(
                soporteService.getTimeline(usuarioId), "Línea de tiempo"));
    }

    /** Acción correctiva: reenviar el correo de confirmación de una entrada. */
    @PostMapping("/acciones/reenviar-confirmacion/{entradaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reenviarConfirmacion(@PathVariable Integer entradaId) {
        return ResponseEntity.ok(ApiResponse.success(
                soporteService.reenviarConfirmacion(entradaId), "Confirmación reenviada"));
    }

    /** Acción correctiva: reactivar una reserva expirada/liberada por error. */
    @PostMapping("/acciones/reactivar-reserva/{entradaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivarReserva(@PathVariable Integer entradaId) {
        return ResponseEntity.ok(ApiResponse.success(
                soporteService.reactivarReserva(entradaId), "Reserva reactivada"));
    }

    /** Acción correctiva: procesar un reembolso simulado de la pasarela sandbox. */
    @PostMapping("/acciones/reembolso/{entradaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOPORTE')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> procesarReembolso(@PathVariable Integer entradaId) {
        return ResponseEntity.ok(ApiResponse.success(
                soporteService.procesarReembolso(entradaId), "Reembolso simulado procesado"));
    }
}