package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.football.FdMatchesApiResponse;
import co.edu.unbosque.dto.football.FdStandingsApiResponse;
import co.edu.unbosque.service.FootballDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/football")
@RequiredArgsConstructor
public class FootballDataController {

    private final FootballDataService footballDataService;

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
}
