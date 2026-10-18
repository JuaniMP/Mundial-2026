package co.edu.unbosque.controller;

import co.edu.unbosque.security.UsuarioActual;
import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.PollaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pollas")
@RequiredArgsConstructor
public class PollaController {

    private final PollaService pollaService;
    private final UsuarioActual usuarioActual;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PollaResponse>>> getAllPollas() {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getAllPollas(), "Pollas encontradas"));
    }

    @GetMapping("/mis-pollas")
    public ResponseEntity<ApiResponse<List<PollaResumenResponse>>> getMisPollas(
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = usuarioActual.id(userDetails);
        return ResponseEntity.ok(ApiResponse.success(pollaService.getMisPollas(usuarioId), "Mis pollas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PollaResponse>> getPollaById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPollaById(id), "Polla encontrada"));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<PollaResponse>> getPollaByCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPollaByCodigo(codigo), "Polla encontrada"));
    }

    @GetMapping("/{id}/ranking")
    public ResponseEntity<ApiResponse<List<RankingEntryResponse>>> getRanking(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getRanking(id), "Ranking de la polla"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PollaResponse>> createPolla(
            @RequestBody PollaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = usuarioActual.id(userDetails);
        PollaResponse polla = pollaService.createPolla(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(polla, "Polla creada"));
    }

    @PostMapping("/unirse/{codigo}")
    public ResponseEntity<ApiResponse<PollaResponse>> joinPolla(
            @PathVariable String codigo,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = usuarioActual.id(userDetails);
        PollaResponse polla = pollaService.joinPolla(codigo, usuarioId);
        return ResponseEntity.ok(ApiResponse.success(polla, "Te uniste a la polla"));
    }

    @GetMapping("/{id}/predicciones")
    public ResponseEntity<ApiResponse<List<PrediccionResponse>>> getPredicciones(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPrediccionesByPolla(id), "Predicciones"));
    }

    @GetMapping("/{id}/mis-predicciones")
    public ResponseEntity<ApiResponse<List<PrediccionResponse>>> getMisPredicciones(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = usuarioActual.id(userDetails);
        return ResponseEntity.ok(ApiResponse.success(pollaService.getMisPredicciones(id, usuarioId), "Mis predicciones"));
    }

    @PostMapping("/predicciones")
    public ResponseEntity<ApiResponse<PrediccionResponse>> createPrediccion(
            @RequestBody PrediccionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = usuarioActual.id(userDetails);
        PrediccionResponse prediccion = pollaService.createPrediccion(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(prediccion, "Predicción guardada"));
    }

    /**
     * Evalúa las predicciones de un partido específico dentro de una polla.
     * Body: { "apiPartidoId": 12345, "marcadorLocal": 2, "marcadorVisitante": 1 }
     */
    @PostMapping("/{id}/evaluar")
    public ResponseEntity<ApiResponse<Void>> evaluarPredicciones(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Long apiPartidoId         = Long.valueOf(body.get("apiPartidoId").toString());
        Integer marcadorLocal     = Integer.valueOf(body.get("marcadorLocal").toString());
        Integer marcadorVisitante = Integer.valueOf(body.get("marcadorVisitante").toString());
        pollaService.evaluarPredicciones(id, apiPartidoId, marcadorLocal, marcadorVisitante);
        return ResponseEntity.ok(ApiResponse.success(null, "Predicciones evaluadas"));
    }
}
