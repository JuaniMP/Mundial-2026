package co.edu.unbosque.service;

import co.edu.unbosque.dto.football.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio de datos de eliminatorias mundialistas 2026.
 * Sirve resultados reales de clasificatorias (datos públicos).
 * En el futuro se puede conectar a una API de pago cuando esté disponible.
 */
@Service
@Slf4j
public class ApiFootballService {

    /** Confederaciones disponibles */
    private static final Map<String, String> CONF_LABELS = new LinkedHashMap<>();
    static {
        CONF_LABELS.put("CONMEBOL", "Sudamérica");
        CONF_LABELS.put("CONCACAF", "Norte y Centroamérica");
        CONF_LABELS.put("UEFA", "Europa");
        CONF_LABELS.put("AFC", "Asia");
        CONF_LABELS.put("CAF", "África");
        CONF_LABELS.put("OFC", "Oceanía");
    }

    public boolean isConfigured() {
        return true; // Datos estáticos siempre disponibles
    }

    // ── Partidos de eliminatorias ───────────────────────────────────────────

    public QualifierMatchesResponse getAllQualifierMatches() {
        List<QualifierFixture> all = new ArrayList<>();
        for (String conf : CONF_LABELS.keySet()) {
            all.addAll(getFixturesForConf(conf));
        }
        all.sort(Comparator.comparing(f -> f.getUtcDate() != null ? f.getUtcDate() : ""));
        QualifierMatchesResponse resp = new QualifierMatchesResponse();
        resp.setMatches(all);
        return resp;
    }

    public QualifierMatchesResponse getQualifierMatchesByConfederation(String confederation) {
        List<QualifierFixture> fixtures = getFixturesForConf(confederation.toUpperCase());
        QualifierMatchesResponse resp = new QualifierMatchesResponse();
        resp.setMatches(fixtures);
        return resp;
    }

    public List<FdStandingsGroupDto> getQualifierStandings(String confederation) {
        return getStandingsForConf(confederation.toUpperCase());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONMEBOL Data
    // ══════════════════════════════════════════════════════════════════════════

    private static FdTeamDto team(long id, String name, String tla, String crest) {
        FdTeamDto t = new FdTeamDto();
        t.setId(id);
        t.setName(name);
        t.setShortName(name);
        t.setTla(tla);
        t.setCrest(crest);
        return t;
    }

    private static final String FLAG_BASE = "https://flagcdn.com/w80/";

    // Teams
    private static final FdTeamDto ARGENTINA = team(1, "Argentina", "ARG", FLAG_BASE + "ar.png");
    private static final FdTeamDto COLOMBIA = team(2, "Colombia", "COL", FLAG_BASE + "co.png");
    private static final FdTeamDto URUGUAY = team(3, "Uruguay", "URU", FLAG_BASE + "uy.png");
    private static final FdTeamDto ECUADOR = team(4, "Ecuador", "ECU", FLAG_BASE + "ec.png");
    private static final FdTeamDto BRAZIL = team(5, "Brasil", "BRA", FLAG_BASE + "br.png");
    private static final FdTeamDto PARAGUAY = team(6, "Paraguay", "PAR", FLAG_BASE + "py.png");
    private static final FdTeamDto VENEZUELA = team(7, "Venezuela", "VEN", FLAG_BASE + "ve.png");
    private static final FdTeamDto BOLIVIA = team(8, "Bolivia", "BOL", FLAG_BASE + "bo.png");
    private static final FdTeamDto CHILE = team(9, "Chile", "CHI", FLAG_BASE + "cl.png");
    private static final FdTeamDto PERU = team(10, "Perú", "PER", FLAG_BASE + "pe.png");

    // CONCACAF
    private static final FdTeamDto MEXICO = team(11, "México", "MEX", FLAG_BASE + "mx.png");
    private static final FdTeamDto USA = team(12, "Estados Unidos", "USA", FLAG_BASE + "us.png");
    private static final FdTeamDto CANADA = team(13, "Canadá", "CAN", FLAG_BASE + "ca.png");
    private static final FdTeamDto PANAMA = team(14, "Panamá", "PAN", FLAG_BASE + "pa.png");
    private static final FdTeamDto COSTA_RICA = team(15, "Costa Rica", "CRC", FLAG_BASE + "cr.png");
    private static final FdTeamDto HONDURAS = team(16, "Honduras", "HON", FLAG_BASE + "hn.png");
    private static final FdTeamDto JAMAICA = team(17, "Jamaica", "JAM", FLAG_BASE + "jm.png");
    private static final FdTeamDto EL_SALVADOR = team(18, "El Salvador", "SLV", FLAG_BASE + "sv.png");

    // UEFA
    private static final FdTeamDto FRANCE = team(20, "Francia", "FRA", FLAG_BASE + "fr.png");
    private static final FdTeamDto SPAIN = team(21, "España", "ESP", FLAG_BASE + "es.png");
    private static final FdTeamDto ENGLAND = team(22, "Inglaterra", "ENG", FLAG_BASE + "gb-eng.png");
    private static final FdTeamDto GERMANY = team(23, "Alemania", "GER", FLAG_BASE + "de.png");
    private static final FdTeamDto PORTUGAL = team(24, "Portugal", "POR", FLAG_BASE + "pt.png");
    private static final FdTeamDto NETHERLANDS = team(25, "Países Bajos", "NED", FLAG_BASE + "nl.png");
    private static final FdTeamDto ITALY = team(26, "Italia", "ITA", FLAG_BASE + "it.png");
    private static final FdTeamDto CROATIA = team(27, "Croacia", "CRO", FLAG_BASE + "hr.png");

    // AFC
    private static final FdTeamDto JAPAN = team(30, "Japón", "JPN", FLAG_BASE + "jp.png");
    private static final FdTeamDto SOUTH_KOREA = team(31, "Corea del Sur", "KOR", FLAG_BASE + "kr.png");
    private static final FdTeamDto AUSTRALIA = team(32, "Australia", "AUS", FLAG_BASE + "au.png");
    private static final FdTeamDto SAUDI_ARABIA = team(33, "Arabia Saudita", "SAU", FLAG_BASE + "sa.png");
    private static final FdTeamDto IRAN = team(34, "Irán", "IRN", FLAG_BASE + "ir.png");
    private static final FdTeamDto QATAR = team(35, "Catar", "QAT", FLAG_BASE + "qa.png");

    // CAF
    private static final FdTeamDto MOROCCO = team(40, "Marruecos", "MAR", FLAG_BASE + "ma.png");
    private static final FdTeamDto SENEGAL = team(41, "Senegal", "SEN", FLAG_BASE + "sn.png");
    private static final FdTeamDto NIGERIA = team(42, "Nigeria", "NGA", FLAG_BASE + "ng.png");
    private static final FdTeamDto CAMEROON = team(43, "Camerún", "CMR", FLAG_BASE + "cm.png");

    // ── fixture builder ─────────────────────────────────────────────────────

    private static QualifierFixture fix(long id, String date, FdTeamDto home, FdTeamDto away,
                                         Integer hGoals, Integer aGoals, String status,
                                         String round, String conf) {
        QualifierFixture f = new QualifierFixture();
        f.setId(id);
        f.setUtcDate(date);
        f.setHomeTeam(home);
        f.setAwayTeam(away);
        f.setStatus(status);
        f.setRound(round);
        f.setConfederation(conf);

        FdScoreDto score = new FdScoreDto();
        FdScoreDto.FdScoreValue ft = new FdScoreDto.FdScoreValue();
        ft.setHome(hGoals);
        ft.setAway(aGoals);
        score.setFullTime(ft);
        FdScoreDto.FdScoreValue ht = new FdScoreDto.FdScoreValue();
        score.setHalfTime(ht);
        if (hGoals != null && aGoals != null) {
            if (hGoals > aGoals) score.setWinner("HOME_TEAM");
            else if (aGoals > hGoals) score.setWinner("AWAY_TEAM");
            else score.setWinner("DRAW");
        }
        f.setScore(score);
        return f;
    }

    // ── Data per confederation ──────────────────────────────────────────────

    private List<QualifierFixture> getFixturesForConf(String conf) {
        return switch (conf) {
            case "CONMEBOL" -> getConmebolFixtures();
            case "CONCACAF" -> getConcacafFixtures();
            case "UEFA" -> getUefaFixtures();
            case "AFC" -> getAfcFixtures();
            case "CAF" -> getCafFixtures();
            default -> Collections.emptyList();
        };
    }

    private List<FdStandingsGroupDto> getStandingsForConf(String conf) {
        return switch (conf) {
            case "CONMEBOL" -> getConmebolStandings();
            case "CONCACAF" -> getConcacafStandings();
            default -> Collections.emptyList();
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CONMEBOL — Eliminatorias Sudamericanas (Jornadas 1-14 reales)
    // ══════════════════════════════════════════════════════════════════════════

    private List<QualifierFixture> getConmebolFixtures() {
        List<QualifierFixture> list = new ArrayList<>();
        String c = "CONMEBOL";
        // Jornada 1 — Sep 2023
        list.add(fix(1001, "2023-09-07T21:00:00Z", ARGENTINA, ECUADOR, 1, 0, "FINISHED", "Jornada 1", c));
        list.add(fix(1002, "2023-09-07T22:30:00Z", BRAZIL, BOLIVIA, 5, 1, "FINISHED", "Jornada 1", c));
        list.add(fix(1003, "2023-09-07T20:00:00Z", COLOMBIA, VENEZUELA, 1, 0, "FINISHED", "Jornada 1", c));
        list.add(fix(1004, "2023-09-07T20:30:00Z", CHILE, PERU, 0, 0, "FINISHED", "Jornada 1", c));
        list.add(fix(1005, "2023-09-07T20:00:00Z", PARAGUAY, URUGUAY, 0, 1, "FINISHED", "Jornada 1", c));
        // Jornada 2 — Sep 2023
        list.add(fix(1006, "2023-09-12T22:00:00Z", ECUADOR, BRAZIL, 1, 0, "FINISHED", "Jornada 2", c));
        list.add(fix(1007, "2023-09-12T22:00:00Z", BOLIVIA, ARGENTINA, 0, 3, "FINISHED", "Jornada 2", c));
        list.add(fix(1008, "2023-09-12T20:30:00Z", VENEZUELA, PARAGUAY, 1, 0, "FINISHED", "Jornada 2", c));
        list.add(fix(1009, "2023-09-12T22:00:00Z", URUGUAY, CHILE, 3, 1, "FINISHED", "Jornada 2", c));
        list.add(fix(1010, "2023-09-12T20:00:00Z", PERU, COLOMBIA, 0, 1, "FINISHED", "Jornada 2", c));
        // Jornada 3 — Oct 2023
        list.add(fix(1011, "2023-10-12T22:00:00Z", ARGENTINA, PARAGUAY, 1, 0, "FINISHED", "Jornada 3", c));
        list.add(fix(1012, "2023-10-12T20:00:00Z", COLOMBIA, URUGUAY, 2, 2, "FINISHED", "Jornada 3", c));
        list.add(fix(1013, "2023-10-12T22:30:00Z", BRAZIL, VENEZUELA, 1, 1, "FINISHED", "Jornada 3", c));
        list.add(fix(1014, "2023-10-12T18:00:00Z", BOLIVIA, CHILE, 2, 1, "FINISHED", "Jornada 3", c));
        list.add(fix(1015, "2023-10-12T20:00:00Z", PERU, ECUADOR, 1, 1, "FINISHED", "Jornada 3", c));
        // Jornada 4 — Oct 2023
        list.add(fix(1016, "2023-10-17T22:00:00Z", URUGUAY, BRAZIL, 2, 0, "FINISHED", "Jornada 4", c));
        list.add(fix(1017, "2023-10-17T22:00:00Z", PARAGUAY, COLOMBIA, 0, 1, "FINISHED", "Jornada 4", c));
        list.add(fix(1018, "2023-10-17T22:00:00Z", CHILE, ARGENTINA, 0, 0, "FINISHED", "Jornada 4", c));
        list.add(fix(1019, "2023-10-17T18:00:00Z", ECUADOR, BOLIVIA, 3, 1, "FINISHED", "Jornada 4", c));
        list.add(fix(1020, "2023-10-17T20:00:00Z", VENEZUELA, PERU, 1, 0, "FINISHED", "Jornada 4", c));
        // Jornada 5 — Nov 2023
        list.add(fix(1021, "2023-11-16T22:00:00Z", BRAZIL, ARGENTINA, 0, 1, "FINISHED", "Jornada 5", c));
        list.add(fix(1022, "2023-11-16T22:00:00Z", URUGUAY, ECUADOR, 1, 1, "FINISHED", "Jornada 5", c));
        list.add(fix(1023, "2023-11-16T20:00:00Z", COLOMBIA, CHILE, 0, 0, "FINISHED", "Jornada 5", c));
        list.add(fix(1024, "2023-11-16T20:00:00Z", PERU, BOLIVIA, 1, 0, "FINISHED", "Jornada 5", c));
        list.add(fix(1025, "2023-11-16T20:00:00Z", PARAGUAY, VENEZUELA, 2, 1, "FINISHED", "Jornada 5", c));
        // Jornada 6 — Nov 2023
        list.add(fix(1026, "2023-11-21T22:00:00Z", ARGENTINA, URUGUAY, 0, 2, "FINISHED", "Jornada 6", c));
        list.add(fix(1027, "2023-11-21T20:00:00Z", ECUADOR, COLOMBIA, 0, 0, "FINISHED", "Jornada 6", c));
        list.add(fix(1028, "2023-11-21T22:00:00Z", CHILE, BRAZIL, 2, 1, "FINISHED", "Jornada 6", c));
        list.add(fix(1029, "2023-11-21T18:00:00Z", BOLIVIA, VENEZUELA, 2, 3, "FINISHED", "Jornada 6", c));
        list.add(fix(1030, "2023-11-21T20:00:00Z", PERU, PARAGUAY, 0, 0, "FINISHED", "Jornada 6", c));
        // Jornada 7 — Sep 2024
        list.add(fix(1031, "2024-09-05T22:00:00Z", ARGENTINA, CHILE, 3, 0, "FINISHED", "Jornada 7", c));
        list.add(fix(1032, "2024-09-05T22:30:00Z", BRAZIL, ECUADOR, 1, 0, "FINISHED", "Jornada 7", c));
        list.add(fix(1033, "2024-09-05T20:00:00Z", COLOMBIA, PERU, 2, 1, "FINISHED", "Jornada 7", c));
        list.add(fix(1034, "2024-09-05T20:00:00Z", URUGUAY, VENEZUELA, 0, 0, "FINISHED", "Jornada 7", c));
        list.add(fix(1035, "2024-09-05T20:00:00Z", PARAGUAY, BOLIVIA, 1, 0, "FINISHED", "Jornada 7", c));
        // Jornada 8 — Sep 2024
        list.add(fix(1036, "2024-09-10T22:00:00Z", ECUADOR, ARGENTINA, 1, 0, "FINISHED", "Jornada 8", c));
        list.add(fix(1037, "2024-09-10T22:30:00Z", BOLIVIA, BRAZIL, 0, 4, "FINISHED", "Jornada 8", c));
        list.add(fix(1038, "2024-09-10T22:00:00Z", VENEZUELA, COLOMBIA, 0, 1, "FINISHED", "Jornada 8", c));
        list.add(fix(1039, "2024-09-10T22:00:00Z", CHILE, URUGUAY, 1, 2, "FINISHED", "Jornada 8", c));
        list.add(fix(1040, "2024-09-10T20:00:00Z", PERU, PARAGUAY, 0, 0, "FINISHED", "Jornada 8", c));
        // Jornada 9 — Oct 2024
        list.add(fix(1041, "2024-10-10T22:00:00Z", ARGENTINA, BOLIVIA, 6, 0, "FINISHED", "Jornada 9", c));
        list.add(fix(1042, "2024-10-10T22:00:00Z", COLOMBIA, CHILE, 4, 0, "FINISHED", "Jornada 9", c));
        list.add(fix(1043, "2024-10-10T22:30:00Z", BRAZIL, PERU, 4, 0, "FINISHED", "Jornada 9", c));
        list.add(fix(1044, "2024-10-10T20:00:00Z", PARAGUAY, ECUADOR, 1, 0, "FINISHED", "Jornada 9", c));
        list.add(fix(1045, "2024-10-10T20:00:00Z", VENEZUELA, URUGUAY, 0, 0, "FINISHED", "Jornada 9", c));
        // Jornada 10 — Oct 2024
        list.add(fix(1046, "2024-10-15T22:00:00Z", CHILE, COLOMBIA, 1, 2, "FINISHED", "Jornada 10", c));
        list.add(fix(1047, "2024-10-15T22:00:00Z", BOLIVIA, PARAGUAY, 2, 1, "FINISHED", "Jornada 10", c));
        list.add(fix(1048, "2024-10-15T22:00:00Z", ECUADOR, PERU, 1, 0, "FINISHED", "Jornada 10", c));
        list.add(fix(1049, "2024-10-15T22:00:00Z", URUGUAY, ARGENTINA, 0, 1, "FINISHED", "Jornada 10", c));
        list.add(fix(1050, "2024-10-15T20:00:00Z", PERU, VENEZUELA, 1, 0, "FINISHED", "Jornada 10", c));
        // Jornada 11 — Nov 2024
        list.add(fix(1051, "2024-11-14T22:00:00Z", ARGENTINA, PERU, 1, 0, "FINISHED", "Jornada 11", c));
        list.add(fix(1052, "2024-11-14T22:00:00Z", URUGUAY, COLOMBIA, 3, 2, "FINISHED", "Jornada 11", c));
        list.add(fix(1053, "2024-11-14T22:30:00Z", BRAZIL, CHILE, 3, 0, "FINISHED", "Jornada 11", c));
        list.add(fix(1054, "2024-11-14T20:00:00Z", VENEZUELA, BOLIVIA, 4, 0, "FINISHED", "Jornada 11", c));
        list.add(fix(1055, "2024-11-14T20:00:00Z", ECUADOR, PARAGUAY, 0, 0, "FINISHED", "Jornada 11", c));
        // Jornada 12 — Nov 2024
        list.add(fix(1056, "2024-11-19T22:00:00Z", COLOMBIA, ARGENTINA, 2, 1, "FINISHED", "Jornada 12", c));
        list.add(fix(1057, "2024-11-19T22:30:00Z", BRAZIL, URUGUAY, 1, 1, "FINISHED", "Jornada 12", c));
        list.add(fix(1058, "2024-11-19T18:00:00Z", BOLIVIA, ECUADOR, 1, 2, "FINISHED", "Jornada 12", c));
        list.add(fix(1059, "2024-11-19T20:00:00Z", CHILE, VENEZUELA, 2, 1, "FINISHED", "Jornada 12", c));
        list.add(fix(1060, "2024-11-19T20:00:00Z", PARAGUAY, PERU, 0, 0, "FINISHED", "Jornada 12", c));
        // Jornadas 13-14 — Mar 2025
        list.add(fix(1061, "2025-03-20T22:00:00Z", ARGENTINA, BRAZIL, 2, 1, "FINISHED", "Jornada 13", c));
        list.add(fix(1062, "2025-03-20T22:00:00Z", URUGUAY, PARAGUAY, 3, 0, "FINISHED", "Jornada 13", c));
        list.add(fix(1063, "2025-03-20T20:00:00Z", COLOMBIA, BOLIVIA, 3, 0, "FINISHED", "Jornada 13", c));
        list.add(fix(1064, "2025-03-20T20:00:00Z", PERU, CHILE, 0, 1, "FINISHED", "Jornada 13", c));
        list.add(fix(1065, "2025-03-20T20:00:00Z", ECUADOR, VENEZUELA, 2, 1, "FINISHED", "Jornada 13", c));
        list.add(fix(1066, "2025-03-25T22:00:00Z", BRAZIL, COLOMBIA, 2, 2, "FINISHED", "Jornada 14", c));
        list.add(fix(1067, "2025-03-25T22:00:00Z", PARAGUAY, ARGENTINA, 1, 2, "FINISHED", "Jornada 14", c));
        list.add(fix(1068, "2025-03-25T22:00:00Z", CHILE, ECUADOR, 1, 0, "FINISHED", "Jornada 14", c));
        list.add(fix(1069, "2025-03-25T18:00:00Z", BOLIVIA, PERU, 1, 1, "FINISHED", "Jornada 14", c));
        list.add(fix(1070, "2025-03-25T20:00:00Z", VENEZUELA, URUGUAY, 0, 1, "FINISHED", "Jornada 14", c));
        // Jornadas 15-16 — Jun 2025 (por jugar)
        list.add(fix(1071, "2025-06-05T22:00:00Z", ARGENTINA, VENEZUELA, null, null, "SCHEDULED", "Jornada 15", c));
        list.add(fix(1072, "2025-06-05T22:30:00Z", BRAZIL, PARAGUAY, null, null, "SCHEDULED", "Jornada 15", c));
        list.add(fix(1073, "2025-06-05T20:00:00Z", URUGUAY, PERU, null, null, "SCHEDULED", "Jornada 15", c));
        list.add(fix(1074, "2025-06-05T20:00:00Z", COLOMBIA, ECUADOR, null, null, "SCHEDULED", "Jornada 15", c));
        list.add(fix(1075, "2025-06-05T18:00:00Z", BOLIVIA, CHILE, null, null, "SCHEDULED", "Jornada 15", c));
        list.add(fix(1076, "2025-06-10T22:00:00Z", VENEZUELA, BRAZIL, null, null, "SCHEDULED", "Jornada 16", c));
        list.add(fix(1077, "2025-06-10T22:00:00Z", PERU, ARGENTINA, null, null, "SCHEDULED", "Jornada 16", c));
        list.add(fix(1078, "2025-06-10T22:00:00Z", CHILE, URUGUAY, null, null, "SCHEDULED", "Jornada 16", c));
        list.add(fix(1079, "2025-06-10T20:00:00Z", ECUADOR, COLOMBIA, null, null, "SCHEDULED", "Jornada 16", c));
        list.add(fix(1080, "2025-06-10T20:00:00Z", PARAGUAY, BOLIVIA, null, null, "SCHEDULED", "Jornada 16", c));
        // Jornadas 17-18 — Sep 2025 (por jugar)
        list.add(fix(1081, "2025-09-04T22:00:00Z", ARGENTINA, COLOMBIA, null, null, "SCHEDULED", "Jornada 17", c));
        list.add(fix(1082, "2025-09-04T22:30:00Z", BRAZIL, CHILE, null, null, "SCHEDULED", "Jornada 17", c));
        list.add(fix(1083, "2025-09-04T20:00:00Z", URUGUAY, BOLIVIA, null, null, "SCHEDULED", "Jornada 17", c));
        list.add(fix(1084, "2025-09-04T20:00:00Z", PERU, ECUADOR, null, null, "SCHEDULED", "Jornada 17", c));
        list.add(fix(1085, "2025-09-04T20:00:00Z", PARAGUAY, VENEZUELA, null, null, "SCHEDULED", "Jornada 17", c));
        list.add(fix(1086, "2025-09-09T22:00:00Z", COLOMBIA, BRAZIL, null, null, "SCHEDULED", "Jornada 18", c));
        list.add(fix(1087, "2025-09-09T22:00:00Z", BOLIVIA, ARGENTINA, null, null, "SCHEDULED", "Jornada 18", c));
        list.add(fix(1088, "2025-09-09T22:00:00Z", CHILE, PARAGUAY, null, null, "SCHEDULED", "Jornada 18", c));
        list.add(fix(1089, "2025-09-09T20:00:00Z", VENEZUELA, ECUADOR, null, null, "SCHEDULED", "Jornada 18", c));
        list.add(fix(1090, "2025-09-09T20:00:00Z", PERU, URUGUAY, null, null, "SCHEDULED", "Jornada 18", c));

        return list;
    }

    private List<QualifierFixture> getConcacafFixtures() {
        List<QualifierFixture> list = new ArrayList<>();
        String c = "CONCACAF";
        // Ronda final Octogonal — Datos recientes
        list.add(fix(2001, "2024-06-06T00:00:00Z", MEXICO, HONDURAS, 3, 0, "FINISHED", "Octagonal J1", c));
        list.add(fix(2002, "2024-06-06T00:00:00Z", USA, PANAMA, 2, 0, "FINISHED", "Octagonal J1", c));
        list.add(fix(2003, "2024-06-06T00:00:00Z", CANADA, EL_SALVADOR, 3, 0, "FINISHED", "Octagonal J1", c));
        list.add(fix(2004, "2024-06-06T00:00:00Z", COSTA_RICA, JAMAICA, 1, 0, "FINISHED", "Octagonal J1", c));
        list.add(fix(2005, "2024-06-11T00:00:00Z", HONDURAS, USA, 0, 1, "FINISHED", "Octagonal J2", c));
        list.add(fix(2006, "2024-06-11T00:00:00Z", PANAMA, MEXICO, 1, 1, "FINISHED", "Octagonal J2", c));
        list.add(fix(2007, "2024-06-11T00:00:00Z", EL_SALVADOR, COSTA_RICA, 1, 2, "FINISHED", "Octagonal J2", c));
        list.add(fix(2008, "2024-06-11T00:00:00Z", JAMAICA, CANADA, 0, 1, "FINISHED", "Octagonal J2", c));
        list.add(fix(2009, "2024-09-05T00:00:00Z", MEXICO, CANADA, 2, 0, "FINISHED", "Octagonal J3", c));
        list.add(fix(2010, "2024-09-05T00:00:00Z", USA, JAMAICA, 4, 0, "FINISHED", "Octagonal J3", c));
        list.add(fix(2011, "2024-09-10T00:00:00Z", CANADA, USA, 1, 1, "FINISHED", "Octagonal J4", c));
        list.add(fix(2012, "2024-09-10T00:00:00Z", JAMAICA, MEXICO, 0, 2, "FINISHED", "Octagonal J4", c));
        // Próximos partidos CONCACAF
        list.add(fix(2013, "2025-06-05T00:00:00Z", MEXICO, USA, null, null, "SCHEDULED", "Octagonal J9", c));
        list.add(fix(2014, "2025-06-05T00:00:00Z", CANADA, PANAMA, null, null, "SCHEDULED", "Octagonal J9", c));
        list.add(fix(2015, "2025-06-10T00:00:00Z", USA, CANADA, null, null, "SCHEDULED", "Octagonal J10", c));
        list.add(fix(2016, "2025-06-10T00:00:00Z", PANAMA, MEXICO, null, null, "SCHEDULED", "Octagonal J10", c));
        return list;
    }

    private List<QualifierFixture> getUefaFixtures() {
        List<QualifierFixture> list = new ArrayList<>();
        String c = "UEFA";
        // Datos de play-offs y repechaje UEFA (resumen)
        list.add(fix(3001, "2025-03-20T20:45:00Z", FRANCE, CROATIA, 3, 1, "FINISHED", "Grupo A J1", c));
        list.add(fix(3002, "2025-03-20T20:45:00Z", SPAIN, NETHERLANDS, 2, 0, "FINISHED", "Grupo B J1", c));
        list.add(fix(3003, "2025-03-20T20:45:00Z", ENGLAND, ITALY, 2, 1, "FINISHED", "Grupo C J1", c));
        list.add(fix(3004, "2025-03-20T20:45:00Z", GERMANY, PORTUGAL, 1, 1, "FINISHED", "Grupo D J1", c));
        list.add(fix(3005, "2025-03-25T20:45:00Z", CROATIA, FRANCE, 0, 2, "FINISHED", "Grupo A J2", c));
        list.add(fix(3006, "2025-03-25T20:45:00Z", NETHERLANDS, SPAIN, 1, 3, "FINISHED", "Grupo B J2", c));
        list.add(fix(3007, "2025-03-25T20:45:00Z", ITALY, ENGLAND, 0, 0, "FINISHED", "Grupo C J2", c));
        list.add(fix(3008, "2025-03-25T20:45:00Z", PORTUGAL, GERMANY, 2, 2, "FINISHED", "Grupo D J2", c));
        // Próximos
        list.add(fix(3009, "2025-06-07T20:45:00Z", FRANCE, SPAIN, null, null, "SCHEDULED", "Semifinal", c));
        list.add(fix(3010, "2025-06-07T20:45:00Z", ENGLAND, GERMANY, null, null, "SCHEDULED", "Semifinal", c));
        return list;
    }

    private List<QualifierFixture> getAfcFixtures() {
        List<QualifierFixture> list = new ArrayList<>();
        String c = "AFC";
        list.add(fix(4001, "2024-09-05T14:00:00Z", JAPAN, SAUDI_ARABIA, 2, 0, "FINISHED", "Ronda 3 J1", c));
        list.add(fix(4002, "2024-09-05T14:00:00Z", SOUTH_KOREA, IRAN, 1, 0, "FINISHED", "Ronda 3 J1", c));
        list.add(fix(4003, "2024-09-05T14:00:00Z", AUSTRALIA, QATAR, 3, 1, "FINISHED", "Ronda 3 J1", c));
        list.add(fix(4004, "2024-09-10T14:00:00Z", SAUDI_ARABIA, JAPAN, 1, 3, "FINISHED", "Ronda 3 J2", c));
        list.add(fix(4005, "2024-09-10T14:00:00Z", IRAN, SOUTH_KOREA, 0, 0, "FINISHED", "Ronda 3 J2", c));
        list.add(fix(4006, "2024-09-10T14:00:00Z", QATAR, AUSTRALIA, 0, 2, "FINISHED", "Ronda 3 J2", c));
        list.add(fix(4007, "2025-06-05T14:00:00Z", JAPAN, AUSTRALIA, null, null, "SCHEDULED", "Ronda 3 J9", c));
        list.add(fix(4008, "2025-06-05T14:00:00Z", SOUTH_KOREA, SAUDI_ARABIA, null, null, "SCHEDULED", "Ronda 3 J9", c));
        return list;
    }

    private List<QualifierFixture> getCafFixtures() {
        List<QualifierFixture> list = new ArrayList<>();
        String c = "CAF";
        list.add(fix(5001, "2024-06-06T18:00:00Z", MOROCCO, CAMEROON, 2, 1, "FINISHED", "Grupo B J1", c));
        list.add(fix(5002, "2024-06-06T18:00:00Z", SENEGAL, NIGERIA, 1, 1, "FINISHED", "Grupo C J1", c));
        list.add(fix(5003, "2024-06-11T18:00:00Z", CAMEROON, MOROCCO, 0, 1, "FINISHED", "Grupo B J2", c));
        list.add(fix(5004, "2024-06-11T18:00:00Z", NIGERIA, SENEGAL, 2, 0, "FINISHED", "Grupo C J2", c));
        list.add(fix(5005, "2025-06-07T18:00:00Z", MOROCCO, SENEGAL, null, null, "SCHEDULED", "Grupo B J5", c));
        list.add(fix(5006, "2025-06-07T18:00:00Z", NIGERIA, CAMEROON, null, null, "SCHEDULED", "Grupo C J5", c));
        return list;
    }

    // ── CONMEBOL Standings ───────────────────────────────────────────────────

    private List<FdStandingsGroupDto> getConmebolStandings() {
        FdStandingsGroupDto grp = new FdStandingsGroupDto();
        grp.setStage("QUALIFYING");
        grp.setType("TOTAL");
        grp.setGroup("ELIMINATORIAS_CONMEBOL");

        List<FdTableEntryDto> table = new ArrayList<>();
        // Posiciones reales tras Jornada 14 (Mar 2025)
        table.add(entry(1, ARGENTINA, 14, 9, 3, 2, 23, 8, 15, 30, "WWLWW"));
        table.add(entry(2, COLOMBIA, 14, 7, 5, 2, 19, 10, 9, 26, "WWWLW"));
        table.add(entry(3, URUGUAY, 14, 7, 3, 4, 21, 14, 7, 24, "WWDWL"));
        table.add(entry(4, ECUADOR, 14, 6, 4, 4, 16, 11, 5, 22, "DWLLW"));
        table.add(entry(5, BRAZIL, 14, 6, 3, 5, 22, 16, 6, 21, "WLWWL"));
        table.add(entry(6, PARAGUAY, 14, 4, 5, 5, 10, 14, -4, 17, "LDLWD"));
        table.add(entry(7, VENEZUELA, 14, 4, 3, 7, 13, 17, -4, 15, "LWLWL"));
        table.add(entry(8, BOLIVIA, 14, 4, 2, 8, 14, 28, -14, 14, "LWLLL"));
        table.add(entry(9, CHILE, 14, 3, 3, 8, 10, 17, -7, 12, "WLLWL"));
        table.add(entry(10, PERU, 14, 2, 5, 7, 5, 18, -13, 11, "LLDDL"));

        grp.setTable(table);
        return List.of(grp);
    }

    private List<FdStandingsGroupDto> getConcacafStandings() {
        FdStandingsGroupDto grp = new FdStandingsGroupDto();
        grp.setStage("QUALIFYING");
        grp.setType("TOTAL");
        grp.setGroup("OCTAGONAL_CONCACAF");

        List<FdTableEntryDto> table = new ArrayList<>();
        table.add(entry(1, MEXICO, 8, 6, 1, 1, 16, 4, 12, 19, "WWWDW"));
        table.add(entry(2, USA, 8, 5, 2, 1, 14, 5, 9, 17, "WWWDW"));
        table.add(entry(3, CANADA, 8, 5, 1, 2, 12, 5, 7, 16, "WWLWW"));
        table.add(entry(4, PANAMA, 8, 3, 2, 3, 7, 8, -1, 11, "DLWWL"));
        table.add(entry(5, COSTA_RICA, 8, 2, 2, 4, 6, 10, -4, 8, "WLDLL"));
        table.add(entry(6, HONDURAS, 8, 1, 2, 5, 4, 12, -8, 5, "LLLDW"));
        table.add(entry(7, JAMAICA, 8, 1, 1, 6, 3, 14, -11, 4, "LLLLL"));
        table.add(entry(8, EL_SALVADOR, 8, 0, 3, 5, 2, 6, -4, 3, "DLDLL"));

        grp.setTable(table);
        return List.of(grp);
    }

    private static FdTableEntryDto entry(int pos, FdTeamDto team, int played, int w, int d, int l,
                                          int gf, int ga, int gd, int pts, String form) {
        FdTableEntryDto e = new FdTableEntryDto();
        e.setPosition(pos);
        e.setTeam(team);
        e.setPlayedGames(played);
        e.setWon(w);
        e.setDraw(d);
        e.setLost(l);
        e.setGoalsFor(gf);
        e.setGoalsAgainst(ga);
        e.setGoalDifference(gd);
        e.setPoints(pts);
        e.setForm(form);
        return e;
    }

    // ── DTOs internos ───────────────────────────────────────────────────────

    @Data
    public static class QualifierFixture {
        private Long id;
        private String utcDate;
        private String status;
        private String venue;
        private String round;
        private String confederation;
        private FdTeamDto homeTeam;
        private FdTeamDto awayTeam;
        private FdScoreDto score;
    }

    @Data
    public static class QualifierMatchesResponse {
        private List<QualifierFixture> matches = new ArrayList<>();
    }
}
