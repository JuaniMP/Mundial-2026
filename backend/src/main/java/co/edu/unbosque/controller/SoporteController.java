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
    public ResponseEntity<ApiResponse<LogResponse>> crearLog(
            @RequestBody LogRequest request,
            @RequestParam Integer usuarioId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(soporteService.crearLog(request, usuarioId), "Log creado"));
    }

    @GetMapping("/logs/{usuarioId}")
    public ResponseEntity<ApiResponse<List<LogResponse>>> getLogs(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getLogsByUsuario(usuarioId), "Logs"));
    }

    @PostMapping("/notificaciones")
    public ResponseEntity<ApiResponse<NotificacionResponse>> crearNotificacion(@RequestBody NotificacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(soporteService.crearNotificacion(request), "Notificación enviada"));
    }

    @GetMapping("/notificaciones/{usuarioId}")
    public ResponseEntity<ApiResponse<List<NotificacionResponse>>> getNotificaciones(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(soporteService.getNotificacionesByUsuario(usuarioId), "Notificaciones"));
    }
}