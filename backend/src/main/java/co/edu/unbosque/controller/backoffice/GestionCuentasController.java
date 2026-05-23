package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.BloquearUsuarioRequest;
import co.edu.unbosque.dto.BackofficeDTOs.UsuarioRiesgoResponse;
import co.edu.unbosque.service.backoffice.GestionCuentasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/usuarios")
@RequiredArgsConstructor
public class GestionCuentasController {

    private final GestionCuentasService cuentasService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<List<UsuarioRiesgoResponse>>> buscar(
            @RequestParam(name = "q", required = false) String q) {
        return ResponseEntity.ok(ApiResponse.success(cuentasService.buscar(q), "Usuarios"));
    }

    @GetMapping("/{id}/riesgo")
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<UsuarioRiesgoResponse>> perfilRiesgo(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                cuentasService.perfil(id), "Perfil de riesgo"));
    }

    @PostMapping("/{id}/bloquear")
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<UsuarioRiesgoResponse>> bloquear(
            @PathVariable Integer id,
            @RequestBody BloquearUsuarioRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                cuentasService.bloquear(id, req.getRazon()), "Usuario bloqueado"));
    }

    @PostMapping("/{id}/desbloquear")
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<UsuarioRiesgoResponse>> desbloquear(
            @PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                cuentasService.desbloquear(id), "Usuario desbloqueado"));
    }
}
