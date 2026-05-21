package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    // ── Preferencias ─────────────────────────────────────────────────────────

    @GetMapping("/preferencias")
    public ResponseEntity<ApiResponse<PreferenciasResponse>> getPreferencias(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getPreferencias(currentUserId(userDetails)),
                "Preferencias"));
    }

    @PutMapping("/preferencias")
    public ResponseEntity<ApiResponse<PreferenciasResponse>> savePreferencias(
            @RequestBody PreferenciasRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.savePreferencias(currentUserId(userDetails), req),
                "Preferencias actualizadas"));
    }

    // ── Agenda ───────────────────────────────────────────────────────────────

    @GetMapping("/agenda")
    public ResponseEntity<ApiResponse<List<AgendaItemResponse>>> getAgenda(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getAgenda(currentUserId(userDetails)),
                "Agenda"));
    }

    @PostMapping("/agenda")
    public ResponseEntity<ApiResponse<AgendaItemResponse>> addAgendaItem(
            @RequestBody AgendaItemRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                perfilService.addAgendaItem(currentUserId(userDetails), req),
                "Item creado"));
    }

    @DeleteMapping("/agenda/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAgendaItem(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        perfilService.deleteAgendaItem(currentUserId(userDetails), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Item eliminado"));
    }

    // ── Viajes ───────────────────────────────────────────────────────────────

    @GetMapping("/viajes")
    public ResponseEntity<ApiResponse<List<RecordatorioViajeResponse>>> getViajes(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getViajes(currentUserId(userDetails)),
                "Viajes"));
    }

    @PostMapping("/viajes")
    public ResponseEntity<ApiResponse<RecordatorioViajeResponse>> addViaje(
            @RequestBody RecordatorioViajeRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                perfilService.addViaje(currentUserId(userDetails), req),
                "Viaje creado"));
    }

    @DeleteMapping("/viajes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteViaje(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        perfilService.deleteViaje(currentUserId(userDetails), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Viaje eliminado"));
    }

    // ── Feed ─────────────────────────────────────────────────────────────────

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getFeed(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                perfilService.getFeed(currentUserId(userDetails)),
                "Feed priorizado"));
    }

    private Integer currentUserId(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new ResourceNotFoundException("No hay sesión activa");
        }
        Usuario u = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return u.getId();
    }
}
