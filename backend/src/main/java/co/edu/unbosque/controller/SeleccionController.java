package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.SeleccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/selecciones")
@RequiredArgsConstructor
public class SeleccionController {

    private final SeleccionService seleccionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeleccionResponse>>> getAllSelecciones() {
        List<SeleccionResponse> selecciones = seleccionService.getAllSelecciones();
        return ResponseEntity.ok(ApiResponse.success(selecciones, "Selecciones encontradas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeleccionResponse>> getSeleccionById(@PathVariable Integer id) {
        SeleccionResponse seleccion = seleccionService.getSeleccionById(id);
        return ResponseEntity.ok(ApiResponse.success(seleccion, "Selección encontrada"));
    }

    @GetMapping("/codigo/{codigoFifa}")
    public ResponseEntity<ApiResponse<SeleccionResponse>> getSeleccionByCodigoFifa(@PathVariable String codigoFifa) {
        SeleccionResponse seleccion = seleccionService.getSeleccionByCodigoFifa(codigoFifa);
        return ResponseEntity.ok(ApiResponse.success(seleccion, "Selección encontrada"));
    }

    @GetMapping("/grupo/{grupo}")
    public ResponseEntity<ApiResponse<List<SeleccionResponse>>> getSeleccionesByGrupo(@PathVariable String grupo) {
        List<SeleccionResponse> selecciones = seleccionService.getSeleccionesByGrupo(grupo);
        return ResponseEntity.ok(ApiResponse.success(selecciones, "Selecciones del grupo"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<SeleccionResponse>> createSeleccion(@RequestBody SeleccionRequest request) {
        SeleccionResponse seleccion = seleccionService.createSeleccion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(seleccion, "Selección creada"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<SeleccionResponse>> updateSeleccion(
            @PathVariable Integer id,
            @RequestBody SeleccionRequest request) {
        SeleccionResponse seleccion = seleccionService.updateSeleccion(id, request);
        return ResponseEntity.ok(ApiResponse.success(seleccion, "Selección actualizada"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSeleccion(@PathVariable Integer id) {
        seleccionService.deleteSeleccion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Selección eliminada"));
    }
}