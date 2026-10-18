package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.security.UsuarioActual;
import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoMasivoRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoProgreso;
import co.edu.unbosque.service.backoffice.ComunicadosMasivosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/backoffice/comunicados")
@RequiredArgsConstructor
public class ComunicadosMasivosController {

    private final ComunicadosMasivosService comunicadosService;
    private final UsuarioActual usuarioActual;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComunicadoProgreso>> enviar(
            @RequestBody ComunicadoMasivoRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer adminId = usuarioActual.id(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                comunicadosService.enviar(adminId, req),
                "Envío masivo iniciado"));
    }

    @GetMapping("/{trackingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComunicadoProgreso>> progreso(
            @PathVariable String trackingId) {
        return ResponseEntity.ok(ApiResponse.success(
                comunicadosService.obtenerProgreso(trackingId), "Progreso"));
    }
}
