package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AlbumController — operaciones sobre el álbum digital de stickers.
 *
 * <p><b>Row-Level Security:</b> todos los endpoints de escritura y lectura
 * privada extraen el usuarioId directamente del JWT, nunca del path.
 * Así un usuario autenticado solo puede ver y modificar SU propio álbum.
 *
 * <p>Excepción: {@code GET /api/v1/album/publico/{usuarioId}} expone
 * el álbum en modo lectura para perfiles públicos (opcional, deshabilitado
 * por defecto, comentado más abajo).
 */
@RestController
@RequestMapping("/api/v1/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService      albumService;
    private final UsuarioRepository usuarioRepository;

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("success", false, "message", "No tienes permiso para acceder a este recurso"));
    }

    private Usuario resolveUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }

    // ── GET /api/v1/album — álbum del usuario autenticado ────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<AlbumResponse>> getMyAlbum(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        return ResponseEntity.ok(ApiResponse.success(
                albumService.getAlbumByUsuario(usuario.getId()), "Album encontrado"));
    }

    // ── POST /api/v1/album/crear — crear álbum para el usuario autenticado ───

    @PostMapping("/crear")
    public ResponseEntity<ApiResponse<AlbumResponse>> createMyAlbum(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        AlbumResponse album = albumService.createAlbum(usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(album, "Album creado"));
    }

    // ── POST /api/v1/album/abrir-paquete ─────────────────────────────────────

    @PostMapping("/abrir-paquete")
    public ResponseEntity<ApiResponse<PaqueteResponse>> abrirPaquete(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        PaqueteResponse paquete = albumService.abrirPaquete(usuario.getId());
        return ResponseEntity.ok(ApiResponse.success(paquete, "Paquete abierto"));
    }

    // ── GET /api/v1/album/laminas ─────────────────────────────────────────────

    @GetMapping("/laminas")
    public ResponseEntity<ApiResponse<List<LaminaAlbumResponse>>> getMyLaminas(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        return ResponseEntity.ok(ApiResponse.success(
                albumService.getLaminasAlbum(usuario.getId()), "Laminas del album"));
    }

    // ── GET /api/v1/album/paquetes-hoy ───────────────────────────────────────

    @GetMapping("/paquetes-hoy")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getPacketesHoy(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        int abiertos = albumService.getPacketesAbiertosHoy(usuario.getId());
        int restantes = Math.max(0, 3 - abiertos);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("abiertos", abiertos, "limite", 3, "restantes", restantes),
                "Paquetes del dia"));
    }

    // ── POST /api/v1/album/pegar/{laminaId} ──────────────────────────────────

    @PostMapping("/pegar/{laminaId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> pegarLamina(
            @PathVariable Integer laminaId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = resolveUsuario(userDetails);
        if (usuario == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(null);
        return ResponseEntity.ok(ApiResponse.success(
                albumService.pegarLamina(usuario.getId(), laminaId), "Lamina pegada"));
    }
}
