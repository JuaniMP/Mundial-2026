package co.edu.unbosque.controller;

import co.edu.unbosque.dto.football.FdMatchDto;
import co.edu.unbosque.dto.football.FdMatchesApiResponse;
import co.edu.unbosque.service.FootballDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * GET /api/v1/estadios
 *
 * Devuelve los venues (sedes) del Mundial 2026 extraídos de los partidos
 * de la API de football-data.org. No se usa ninguna tabla local.
 */
@RestController
@RequestMapping("/api/v1/estadios")
@RequiredArgsConstructor
@Slf4j
public class EstadioController {

    private final FootballDataService footballDataService;

    /**
     * Agrega los venues únicos de todos los partidos del Mundial 2026.
     * Útil para el mapa interactivo del frontend.
     */
    @GetMapping
    public ResponseEntity<?> getAllEstadios() {
        try {
            FdMatchesApiResponse resp = footballDataService.getAllMatches();
            if (resp == null || resp.getMatches() == null) {
                return ResponseEntity.ok(Map.of("success", true, "data", List.of()));
            }

            // Deduplica venues por nombre
            List<Map<String, Object>> venues = resp.getMatches().stream()
                    .filter(m -> m.getVenue() != null && !m.getVenue().isBlank())
                    .collect(Collectors.groupingBy(FdMatchDto::getVenue, LinkedHashMap::new, Collectors.toList()))
                    .entrySet().stream()
                    .map(entry -> {
                        FdMatchDto sample = entry.getValue().get(0);
                        Map<String, Object> v = new LinkedHashMap<>();
                        v.put("nombre", entry.getKey());
                        // Los equipos locales pueden darnos la ciudad aproximada
                        v.put("partidos", entry.getValue().size());
                        return v;
                    })
                    .collect(Collectors.toList());

            log.info("📍 Returning {} venues from football-data.org", venues.size());
            return ResponseEntity.ok(Map.of("success", true, "data", venues));

        } catch (Exception e) {
            log.warn("⚠️  No se pudieron obtener venues: {}", e.getMessage());
            return ResponseEntity.ok(Map.of("success", true, "data", List.of()));
        }
    }
}
