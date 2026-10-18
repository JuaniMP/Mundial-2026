package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.security.UsuarioActual;
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
 * Álbum del usuario autenticado. El usuario se obtiene del JWT, nunca de la URL:
 * así nadie puede abrir paquetes ni pegar láminas en el álbum de otra persona.
 */
@RestController
@RequestMapping("/api/v1/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;
    private final UsuarioActual usuarioActual;

    @GetMapping
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbum(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
                albumService.getAlbumByUsuario(usuarioActual.id(user)), "Album encontrado"));
    }

    @PostMapping("/crear")
    public ResponseEntity<ApiResponse<AlbumResponse>> createAlbum(@AuthenticationPrincipal UserDetails user) {
        AlbumResponse album = albumService.createAlbum(usuarioActual.id(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(album, "Album creado"));
    }

    @PostMapping("/abrir-paquete")
    public ResponseEntity<ApiResponse<PaqueteResponse>> abrirPaquete(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
                albumService.abrirPaquete(usuarioActual.id(user)), "Paquete abierto"));
    }

    @GetMapping("/laminas")
    public ResponseEntity<ApiResponse<List<LaminaAlbumResponse>>> getLaminas(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
                albumService.getLaminasAlbum(usuarioActual.id(user)), "Laminas del album"));
    }

    @GetMapping("/paquetes-abiertos")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPaquetesAbiertos(@AuthenticationPrincipal UserDetails user) {
        long abiertos = albumService.getPaquetesAbiertosUsuario(usuarioActual.id(user));
        return ResponseEntity.ok(ApiResponse.success(Map.of("abiertos", abiertos), "Paquetes abiertos"));
    }

    @GetMapping("/todas")
    public ResponseEntity<ApiResponse<List<LaminaAlbumResponse>>> getAllLaminas(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(
                albumService.getAllLaminasConEstado(usuarioActual.id(user)), "Todas las laminas con estado"));
    }

    @PostMapping("/pegar/{laminaId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> pegarLamina(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Integer laminaId) {
        return ResponseEntity.ok(ApiResponse.success(
                albumService.pegarLamina(usuarioActual.id(user), laminaId), "Lamina pegada"));
    }
}
