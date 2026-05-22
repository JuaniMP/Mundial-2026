package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService    usuarioService;
    private final UsuarioRepository usuarioRepository;

    // ── Perfil propio — cualquier usuario autenticado ─────────────────────────

    /**
     * GET /api/v1/usuarios/me
     * Devuelve el perfil del usuario autenticado (sin exponer IDs de otros).
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(ApiResponse.success(
                usuarioService.getUsuarioById(usuario.getId()), "Perfil encontrado"));
    }

    // ── Endpoints de administración — sólo roles privilegiados ───────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'SOPORTE', 'COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> getAllUsuarios() {
        return ResponseEntity.ok(ApiResponse.success(
                usuarioService.getAllUsuarios(), "Usuarios encontrados"));
    }

    /**
     * GET /api/v1/usuarios/{id}
     * Solo accesible por ADMIN u OPERADOR.
     * Los usuarios normales deben usar /me.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getUsuarioById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(
                usuarioService.getUsuarioById(id), "Usuario encontrado"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> createUsuario(
            @RequestBody UsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.createUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(usuario, "Usuario creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> updateUsuario(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                usuarioService.updateUsuario(id, request), "Usuario actualizado"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUsuario(@PathVariable Integer id) {
        usuarioService.deleteUsuario(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario eliminado"));
    }
}
