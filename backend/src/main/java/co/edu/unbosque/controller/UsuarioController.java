package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR', 'SOPORTE', 'COMPLIANCE')")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> getAllUsuarios() {
        List<UsuarioResponse> usuarios = usuarioService.getAllUsuarios();
        return ResponseEntity.ok(ApiResponse.success(usuarios, "Usuarios encontrados"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponse>> getUsuarioById(@PathVariable Integer id) {
        UsuarioResponse usuario = usuarioService.getUsuarioById(id);
        return ResponseEntity.ok(ApiResponse.success(usuario, "Usuario encontrado"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> createUsuario(@RequestBody UsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.createUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(usuario, "Usuario creado exitosamente"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<UsuarioResponse>> updateUsuario(
            @PathVariable Integer id,
            @RequestBody UsuarioRequest request) {
        UsuarioResponse usuario = usuarioService.updateUsuario(id, request);
        return ResponseEntity.ok(ApiResponse.success(usuario, "Usuario actualizado"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUsuario(@PathVariable Integer id) {
        usuarioService.deleteUsuario(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario eliminado"));
    }
}