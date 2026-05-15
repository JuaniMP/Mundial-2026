package co.edu.unbosque.service;

import co.edu.unbosque.dto.football.FdMatchesApiResponse;
import co.edu.unbosque.dto.football.FdStandingsApiResponse;
import co.edu.unbosque.dto.football.FdTeamsApiResponse;
import co.edu.unbosque.dto.football.FdTeamFullDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class FootballDataService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final String competition;
    private final String season;

    public FootballDataService(
            @Value("${footballdata.api.key}") String apiKey,
            @Value("${footballdata.api.base-url}") String baseUrl,
            @Value("${footballdata.competition}") String competition,
            @Value("${footballdata.season}") String season) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.competition = competition;
        this.season = season;
        this.restTemplate = new RestTemplate();
    }

    // ── Partidos ─────────────────────────────────────────────────────────────

    @Cacheable("fd-matches-all")
    public FdMatchesApiResponse getAllMatches() {
        String url = baseUrl + "/competitions/" + competition + "/matches?season=" + season;
        return fetch(url, FdMatchesApiResponse.class);
    }

    @Cacheable(value = "fd-matches-stage", key = "#stage")
    public FdMatchesApiResponse getMatchesByStage(String stage) {
        String url = baseUrl + "/competitions/" + competition + "/matches?season=" + season + "&stage=" + stage;
        return fetch(url, FdMatchesApiResponse.class);
    }

    @Cacheable(value = "fd-matches-matchday", key = "#matchday")
    public FdMatchesApiResponse getMatchesByMatchday(int matchday) {
        String url = baseUrl + "/competitions/" + competition + "/matches?season=" + season + "&matchday=" + matchday;
        return fetch(url, FdMatchesApiResponse.class);
    }

    // ── Equipos (selecciones) ─────────────────────────────────────────────────

    @Cacheable("fd-teams")
    public FdTeamsApiResponse getTeams() {
        String url = baseUrl + "/competitions/" + competition + "/teams?season=" + season;
        return fetch(url, FdTeamsApiResponse.class);
    }

    @Cacheable(value = "fd-squad", key = "#teamId")
    public FdTeamFullDto getTeamWithSquad(Long teamId) {
        String url = baseUrl + "/teams/" + teamId;
        return fetch(url, FdTeamFullDto.class);
    }

    // ── Tabla de posiciones ───────────────────────────────────────────────────

    @Cacheable("fd-standings")
    public FdStandingsApiResponse getStandings() {
        String url = baseUrl + "/competitions/" + competition + "/standings?season=" + season;
        return fetch(url, FdStandingsApiResponse.class);
    }

    // ── HTTP Helper ────────────────────────────────────────────────────────────

    private <T> T fetch(String url, Class<T> responseType) {
        if (apiKey.equals("TU_API_KEY_AQUI") || apiKey.isBlank()) {
            log.warn("⚠️  Football Data API key not configured. Set FOOTBALL_DATA_KEY env var or update application.properties");
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Auth-Token", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            log.debug("📡 Calling football-data.org: {}", url);
            ResponseEntity<T> response = restTemplate.exchange(url, HttpMethod.GET, entity, responseType);
            log.debug("✅ Football-data.org response: {} items", url);
            return response.getBody();
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("⛔ Rate limit hit on football-data.org (10 req/min). Using cached data.");
            return null;
        } catch (HttpClientErrorException.Unauthorized e) {
            log.error("🔑 Invalid API key for football-data.org");
            return null;
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("⚠️ Resource not found on football-data.org (tournament may not have started yet): {}", url);
            return null;
        } catch (Exception e) {
            log.error("❌ Error calling football-data.org: {}", e.getMessage());
            return null;
        }
    }
}
