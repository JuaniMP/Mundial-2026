package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.football.FdMatchDto;
import co.edu.unbosque.dto.football.FdMatchesApiResponse;
import co.edu.unbosque.dto.football.FdPlayerDto;
import co.edu.unbosque.dto.football.FdTeamFullDto;
import co.edu.unbosque.dto.football.FdTeamsApiResponse;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.service.FootballDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Compatibilidad para rutas legacy usadas por partes del frontend.
 * Estas rutas transforman datos de football-data al shape histórico del proyecto.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class LegacyCatalogController {

    private final FootballDataService footballDataService;

    @GetMapping("/partidos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPartidos() {
        FdMatchesApiResponse resp = footballDataService.getAllMatches();
        if (resp == null || resp.getMatches() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of(), "Partidos"));
        }

        List<Map<String, Object>> data = resp.getMatches().stream()
                .map(this::toLegacyPartido)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Partidos"));
    }

    @GetMapping("/selecciones")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSelecciones() {
        FdTeamsApiResponse resp = footballDataService.getTeams();
        if (resp == null || resp.getTeams() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of(), "Selecciones"));
        }

        List<Map<String, Object>> data = resp.getTeams().stream()
                .map(this::toLegacySeleccion)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Selecciones"));
    }

    @GetMapping("/selecciones/codigo/{codigo}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSeleccionByCodigo(@PathVariable String codigo) {
        FdTeamsApiResponse resp = footballDataService.getTeams();
        if (resp == null || resp.getTeams() == null) {
            throw new ResourceNotFoundException("Selección no encontrada");
        }

        FdTeamFullDto team = resp.getTeams().stream()
                .filter(t -> t.getTla() != null && codigo.equalsIgnoreCase(t.getTla()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada"));

        return ResponseEntity.ok(ApiResponse.success(toLegacySeleccion(team), "Selección"));
    }

    @GetMapping("/selecciones/{id}/jugadores")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getJugadoresBySeleccion(@PathVariable Integer id) {
        FdTeamFullDto team = footballDataService.getTeamWithSquad(id.longValue());
        if (team == null || team.getSquad() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of(), "Jugadores"));
        }

        List<Map<String, Object>> data = team.getSquad().stream()
                .map(p -> toLegacyJugador(p, id, team.getName()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Jugadores"));
    }

    @GetMapping("/selecciones/{id}/partidos/proximos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPartidosProximosBySeleccion(
            @PathVariable Integer id) {
        FdMatchesApiResponse resp = footballDataService.getAllMatches();
        if (resp == null || resp.getMatches() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of(), "Partidos próximos"));
        }

        long teamId = id.longValue();
        List<Map<String, Object>> data = resp.getMatches().stream()
                .filter(m -> m.getHomeTeam() != null && m.getAwayTeam() != null)
                .filter(m -> Objects.equals(m.getHomeTeam().getId(), teamId)
                        || Objects.equals(m.getAwayTeam().getId(), teamId))
                .filter(m -> m.getStatus() == null || !"FINISHED".equalsIgnoreCase(m.getStatus()))
                .sorted(Comparator.comparing(FdMatchDto::getUtcDate, Comparator.nullsLast(String::compareTo)))
                .limit(5)
                .map(this::toLegacyPartido)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(data, "Partidos próximos"));
    }

    private Map<String, Object> toLegacyPartido(FdMatchDto m) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", safeInt(m.getId()));
        out.put("fechaHora", m.getUtcDate());
        out.put("ronda", m.getStage());
        out.put("estado", m.getStatus());
        out.put("marcadorLocal", m.getScore() != null && m.getScore().getFullTime() != null
                && m.getScore().getFullTime().getHome() != null ? m.getScore().getFullTime().getHome() : 0);
        out.put("marcadorVisitante", m.getScore() != null && m.getScore().getFullTime() != null
                && m.getScore().getFullTime().getAway() != null ? m.getScore().getFullTime().getAway() : 0);
        out.put("idEstadio", 0);
        out.put("estadioNombre", m.getVenue() != null ? m.getVenue() : "Por definir");
        out.put("seleccionLocal", m.getHomeTeam() != null ? m.getHomeTeam().getName() : "Por definir");
        out.put("seleccionVisitante", m.getAwayTeam() != null ? m.getAwayTeam().getName() : "Por definir");
        return out;
    }

    private Map<String, Object> toLegacySeleccion(FdTeamFullDto t) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", safeInt(t.getId()));
        out.put("pais", t.getName());
        out.put("codigoFifa", t.getTla());
        out.put("confederacion", "");
        out.put("grupo", "");
        out.put("historial", null);
        out.put("banderaUrl", t.getCrest());
        return out;
    }

    private Map<String, Object> toLegacyJugador(FdPlayerDto p, Integer seleccionId, String pais) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", safeInt(p.getId()));
        out.put("nombreCompleto", p.getName());
        out.put("posicion", p.getPosition() != null ? p.getPosition() : "N/A");
        out.put("dorsal", p.getShirtNumber() != null ? p.getShirtNumber() : 0);
        out.put("fechaNacimiento", p.getDateOfBirth());
        out.put("nacionalidad", p.getNationality());
        out.put("minutosJugados", 0);
        out.put("goles", 0);
        out.put("fotoUrl", null);
        out.put("popularidad", null);
        out.put("idSeleccion", seleccionId);
        out.put("pais", pais);
        return out;
    }

    private Integer safeInt(Long value) {
        if (value == null) return 0;
        try {
            return Math.toIntExact(value);
        } catch (ArithmeticException ignored) {
            return 0;
        }
    }
}
