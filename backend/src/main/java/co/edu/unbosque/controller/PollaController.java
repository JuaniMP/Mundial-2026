package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.PollaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pollas")
@RequiredArgsConstructor
public class PollaController {

    private final PollaService pollaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PollaResponse>>> getAllPollas() {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getAllPollas(), "Pollas encontradas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PollaResponse>> getPollaById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPollaById(id), "Polla encontrada"));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<PollaResponse>> getPollaByCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPollaByCodigo(codigo), "Polla encontrada"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PollaResponse>> createPolla(
            @RequestBody PollaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = getUsuarioIdFromDetails(userDetails);
        PollaResponse polla = pollaService.createPolla(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(polla, "Polla creada"));
    }

    @PostMapping("/unirse/{codigo}")
    public ResponseEntity<ApiResponse<PollaResponse>> joinPolla(
            @PathVariable String codigo,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = getUsuarioIdFromDetails(userDetails);
        PollaResponse polla = pollaService.joinPolla(codigo, usuarioId);
        return ResponseEntity.ok(ApiResponse.success(polla, "Te uniste a la polla"));
    }

    @GetMapping("/{id}/predicciones")
    public ResponseEntity<ApiResponse<List<PrediccionResponse>>> getPredicciones(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(pollaService.getPrediccionesByPolla(id), "Predicciones"));
    }

    @PostMapping("/predicciones")
    public ResponseEntity<ApiResponse<PrediccionResponse>> createPrediccion(
            @RequestBody PrediccionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer usuarioId = getUsuarioIdFromDetails(userDetails);
        PrediccionResponse prediccion = pollaService.createPrediccion(request, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(prediccion, "Predicción creada"));
    }

    @PostMapping("/{id}/evaluar")
    public ResponseEntity<ApiResponse<Void>> evaluarPredicciones(@PathVariable Integer id) {
        pollaService.evaluarPredicciones(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Predicciones evaluadas"));
    }

    private Integer getUsuarioIdFromDetails(UserDetails userDetails) {
        return 1;
    }
}