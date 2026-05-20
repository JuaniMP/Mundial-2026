package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.football.*;
import co.edu.unbosque.service.ApiFootballService;
import co.edu.unbosque.service.ApiFootballService.QualifierMatchesResponse;
import co.edu.unbosque.service.FootballDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/football")
@RequiredArgsConstructor
public class FootballDataController {

    private final FootballDataService footballDataService;
    private final ApiFootballService apiFootballService;

    /**
     * GET /api/v1/football/matches
     * Todos los partidos del Mundial 2026.
     * Query param opcional: stage=GROUP_STAGE | ROUND_OF_16 | QUARTER_FINALS | SEMI_FINALS | FINAL
     */
    @GetMapping("/matches")
    public ResponseEntity<ApiResponse<FdMatchesApiResponse>> getMatches(
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) Integer matchday) {

        FdMatchesApiResponse data;
        if (stage != null) {
            data = footballDataService.getMatchesByStage(stage);
        } else if (matchday != null) {
            data = footballDataService.getMatchesByMatchday(matchday);
        } else {
            data = footballDataService.getAllMatches();
        }

        if (data == null) {
            return ResponseEntity.ok(ApiResponse.error(null, "API key no configurada o error al contactar football-data.org"));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "Partidos obtenidos"));
    }

    /**
     * GET /api/v1/football/standings
     * Tabla de posiciones por grupo (fase de grupos).
     */
    @GetMapping("/standings")
    public ResponseEntity<ApiResponse<FdStandingsApiResponse>> getStandings() {
        FdStandingsApiResponse data = footballDataService.getStandings();

        if (data == null) {
            return ResponseEntity.ok(ApiResponse.error(null, "API key no configurada o error al contactar football-data.org"));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "Tabla de posiciones obtenida"));
    }

    /**
     * GET /api/v1/football/teams
     * Todas las selecciones clasificadas al Mundial 2026.
     */
    @GetMapping("/teams")
    public ResponseEntity<ApiResponse<FdTeamsApiResponse>> getTeams() {
        FdTeamsApiResponse data = footballDataService.getTeams();

        if (data == null) {
            return ResponseEntity.ok(ApiResponse.error(null, "API key no configurada o error al contactar football-data.org"));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "Selecciones obtenidas"));
    }

    /**
     * GET /api/v1/football/teams/{id}
     * Detalle de una selección con su squad completo.
     */
    @GetMapping("/teams/{id}")
    public ResponseEntity<ApiResponse<FdTeamFullDto>> getTeamSquad(@PathVariable Long id) {
        FdTeamFullDto data = footballDataService.getTeamWithSquad(id);

        if (data == null) {
            return ResponseEntity.ok(ApiResponse.error(null, "No se encontró información para el equipo " + id));
        }
        return ResponseEntity.ok(ApiResponse.success(data, "Squad obtenido"));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ELIMINATORIAS — World Cup Qualifiers (via API-Football / RapidAPI)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/football/qualifiers/matches
     * Partidos de eliminatorias mundialistas de todas las confederaciones.
     * Query param opcional: confederation=CONMEBOL|CONCACAF|UEFA|AFC|CAF|OFC
     */
    @GetMapping("/qualifiers/matches")
    public ResponseEntity<ApiResponse<QualifierMatchesResponse>> getQualifierMatches(
            @RequestParam(required = false) String confederation) {

        if (!apiFootballService.isConfigured()) {
            return ResponseEntity.ok(ApiResponse.error(null,
                    "API-Football key no configurada. Set APIFOOTBALL_KEY env var."));
        }

        QualifierMatchesResponse data;
        if (confederation != null && !confederation.isBlank()) {
            data = apiFootballService.getQualifierMatchesByConfederation(confederation);
        } else {
            data = apiFootballService.getAllQualifierMatches();
        }

        return ResponseEntity.ok(ApiResponse.success(data, "Partidos de eliminatorias obtenidos"));
    }

    /**
     * GET /api/v1/football/qualifiers/standings
     * Tabla de posiciones de eliminatorias por confederación.
     * Query param requerido: confederation=CONMEBOL|CONCACAF|UEFA|AFC|CAF|OFC
     */
    @GetMapping("/qualifiers/standings")
    public ResponseEntity<ApiResponse<List<FdStandingsGroupDto>>> getQualifierStandings(
            @RequestParam String confederation) {

        if (!apiFootballService.isConfigured()) {
            return ResponseEntity.ok(ApiResponse.error(null,
                    "API-Football key no configurada. Set APIFOOTBALL_KEY env var."));
        }

        List<FdStandingsGroupDto> data = apiFootballService.getQualifierStandings(confederation);
        return ResponseEntity.ok(ApiResponse.success(data,
                "Standings de eliminatorias " + confederation + " obtenidos"));
    }
}
