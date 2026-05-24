package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.TravelSuggestionsDto;
import co.edu.unbosque.service.AgenteViajeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/viaje")
@RequiredArgsConstructor
public class AgenteViajeController {

    private final AgenteViajeService agenteViajeService;

    /**
     * GET /api/v1/viaje/sugerencias?estadio=MetLife+Stadium
     * Devuelve sugerencias de hoteles, vuelos y atracciones para el estadio indicado.
     * No requiere autenticación (datos públicos / externos).
     */
    @GetMapping("/sugerencias")
    public ResponseEntity<ApiResponse<TravelSuggestionsDto>> getSugerencias(
            @RequestParam(defaultValue = "MetLife Stadium") String estadio) {
        TravelSuggestionsDto sugerencias = agenteViajeService.getSugerencias(estadio);
        return ResponseEntity.ok(ApiResponse.success(sugerencias, "Sugerencias de viaje para " + sugerencias.getEstadio()));
    }
}
