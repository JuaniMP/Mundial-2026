package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.PartidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/partidos")
@RequiredArgsConstructor
public class PartidoController {

    private final PartidoService partidoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PartidoResponse>>> getAllPartidos() {
        List<PartidoResponse> partidos = partidoService.getAllPartidos();
        return ResponseEntity.ok(ApiResponse.success(partidos, "Partidos encontrados"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PartidoResponse>> getPartidoById(@PathVariable Integer id) {
        PartidoResponse partido = partidoService.getPartidoById(id);
        return ResponseEntity.ok(ApiResponse.success(partido, "Partido encontrado"));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponse<List<PartidoResponse>>> getPartidosByEstado(@PathVariable String estado) {
        List<PartidoResponse> partidos = partidoService.getPartidosByEstado(estado);
        return ResponseEntity.ok(ApiResponse.success(partidos, "Partidos por estado"));
    }

    @GetMapping("/ronda/{ronda}")
    public ResponseEntity<ApiResponse<List<PartidoResponse>>> getPartidosByRonda(@PathVariable String ronda) {
        List<PartidoResponse> partidos = partidoService.getPartidosByRonda(ronda);
        return ResponseEntity.ok(ApiResponse.success(partidos, "Partidos por ronda"));
    }

    @GetMapping("/seleccion/{seleccionId}")
    public ResponseEntity<ApiResponse<List<PartidoResponse>>> getPartidosBySeleccion(@PathVariable Integer seleccionId) {
        List<PartidoResponse> partidos = partidoService.getPartidosBySeleccion(seleccionId);
        return ResponseEntity.ok(ApiResponse.success(partidos, "Partidos de la selección"));
    }

    @GetMapping("/seleccion/{seleccionId}/proximos")
    public ResponseEntity<ApiResponse<List<PartidoResponse>>> getProximosPartidosBySeleccion(@PathVariable Integer seleccionId) {
        List<PartidoResponse> partidos = partidoService.getProximosPartidosBySeleccion(seleccionId);
        return ResponseEntity.ok(ApiResponse.success(partidos, "Próximos partidos de la selección"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<PartidoResponse>> createPartido(@RequestBody PartidoRequest request) {
        PartidoResponse partido = partidoService.createPartido(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(partido, "Partido creado"));
    }

    @PutMapping("/{id}/resultado")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<PartidoResponse>> updateResultado(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer marcadorLocal = body.get("marcadorLocal");
        Integer marcadorVisitante = body.get("marcadorVisitante");
        PartidoResponse partido = partidoService.updateResultado(id, marcadorLocal, marcadorVisitante);
        return ResponseEntity.ok(ApiResponse.success(partido, "Resultado actualizado"));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<PartidoResponse>> updateEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        PartidoResponse partido = partidoService.updateEstado(id, estado);
        return ResponseEntity.ok(ApiResponse.success(partido, "Estado actualizado"));
    }
}