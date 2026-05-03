package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.AlbumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/album")
@RequiredArgsConstructor
public class AlbumController {

    private final AlbumService albumService;

    @GetMapping("/{usuarioId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> getAlbum(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(albumService.getAlbumByUsuario(usuarioId), "Album encontrado"));
    }

    @PostMapping("/crear/{usuarioId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> createAlbum(@PathVariable Integer usuarioId) {
        AlbumResponse album = albumService.createAlbum(usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(album, "Album creado"));
    }

    @PostMapping("/abrir-paquete/{usuarioId}")
    public ResponseEntity<ApiResponse<PaqueteResponse>> abrirPaquete(@PathVariable Integer usuarioId) {
        PaqueteResponse paquete = albumService.abrirPaquete(usuarioId);
        return ResponseEntity.ok(ApiResponse.success(paquete, "Paquete abierto"));
    }

    @GetMapping("/laminas/{usuarioId}")
    public ResponseEntity<ApiResponse<List<LaminaAlbumResponse>>> getLaminas(@PathVariable Integer usuarioId) {
        return ResponseEntity.ok(ApiResponse.success(albumService.getLaminasAlbum(usuarioId), "Laminas del album"));
    }

    @PostMapping("/pegar/{usuarioId}/{laminaId}")
    public ResponseEntity<ApiResponse<AlbumResponse>> pegarLamina(
            @PathVariable Integer usuarioId,
            @PathVariable Integer laminaId) {
        return ResponseEntity.ok(ApiResponse.success(albumService.pegarLamina(usuarioId, laminaId), "Lamina pegada"));
    }
}