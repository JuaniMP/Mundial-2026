package co.edu.unbosque.controller;

import co.edu.unbosque.dto.EstadioDto;
import co.edu.unbosque.entity.Estadio;
import co.edu.unbosque.repository.EstadioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/estadios")
@RequiredArgsConstructor
@Slf4j
public class EstadioController {

    private final EstadioRepository estadioRepository;

    /**
     * GET /api/v1/estadios
     * Returns all WC 2026 stadiums that have coordinates (lat/lng set).
     */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAllEstadios() {
        List<EstadioDto> dtos = estadioRepository.findAll().stream()
                .filter(e -> e.getLat() != null && e.getLng() != null)
                .map(this::toDto)
                .toList();

        log.info("📍 Returning {} estadios with coordinates", dtos.size());
        return ResponseEntity.ok(Map.of("success", true, "data", dtos));
    }

    /**
     * GET /api/v1/estadios/{id}
     */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getEstadio(@PathVariable Integer id) {
        return estadioRepository.findById(id)
                .filter(e -> e.getLat() != null)
                .map(e -> ResponseEntity.ok(Map.of("success", true, "data", toDto(e))))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private EstadioDto toDto(Estadio e) {
        String ciudad = e.getSede() != null ? e.getSede().getCiudad() : "";
        String pais   = e.getSede() != null ? e.getSede().getPais()   : "";
        return EstadioDto.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .ciudad(ciudad)
                .pais(pais)
                .capacidad(e.getCapacidad())
                .lat(e.getLat())
                .lng(e.getLng())
                .direccion(e.getDireccion())
                .build();
    }
}
