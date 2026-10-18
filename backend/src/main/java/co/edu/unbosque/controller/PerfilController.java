package co.edu.unbosque.controller;

import co.edu.unbosque.security.UsuarioActual;
import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.PerfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/perfil")
@RequiredArgsConstructor
public class PerfilController {

    private final PerfilService perfilService;
    private final UsuarioActual usuarioActual;

    // ── Preferencias ─────────────────────────────────────────────────────────

    @GetMapping("/preferencias")
    public ResponseEntity<ApiResponse<PreferenciasResponse>> getPreferencias(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getPreferencias(usuarioActual.id(userDetails)),
                "Preferencias"));
    }

    @PutMapping("/preferencias")
    public ResponseEntity<ApiResponse<PreferenciasResponse>> savePreferencias(
            @RequestBody PreferenciasRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.savePreferencias(usuarioActual.id(userDetails), req),
                "Preferencias actualizadas"));
    }

    // ── Agenda ───────────────────────────────────────────────────────────────

    @GetMapping("/agenda")
    public ResponseEntity<ApiResponse<List<AgendaItemResponse>>> getAgenda(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getAgenda(usuarioActual.id(userDetails)),
                "Agenda"));
    }

    @PostMapping("/agenda")
    public ResponseEntity<ApiResponse<AgendaItemResponse>> addAgendaItem(
            @RequestBody AgendaItemRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                perfilService.addAgendaItem(usuarioActual.id(userDetails), req),
                "Item creado"));
    }

    @DeleteMapping("/agenda/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgendaItem(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        perfilService.deleteAgendaItem(usuarioActual.id(userDetails), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Item eliminado"));
    }

    // ── Viajes ───────────────────────────────────────────────────────────────

    @GetMapping("/viajes")
    public ResponseEntity<ApiResponse<List<RecordatorioViajeResponse>>> getViajes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getViajes(usuarioActual.id(userDetails)),
                "Viajes"));
    }

    @PostMapping("/viajes")
    public ResponseEntity<ApiResponse<RecordatorioViajeResponse>> addViaje(
            @RequestBody RecordatorioViajeRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                perfilService.addViaje(usuarioActual.id(userDetails), req),
                "Viaje creado"));
    }

    @DeleteMapping("/viajes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteViaje(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        perfilService.deleteViaje(usuarioActual.id(userDetails), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Viaje eliminado"));
    }

    // ── Feed ─────────────────────────────────────────────────────────────────

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getFeed(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getFeed(usuarioActual.id(userDetails)),
                "Feed priorizado"));
    }
}
