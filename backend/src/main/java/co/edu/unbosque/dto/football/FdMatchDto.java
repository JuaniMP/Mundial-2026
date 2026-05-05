package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdMatchDto {
    private Long id;
    private String utcDate;
    private String status;      // SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED
    private Integer matchday;
    private String stage;       // GROUP_STAGE, ROUND_OF_16, QUARTER_FINALS, SEMI_FINALS, FINAL
    private String group;       // GROUP_A, GROUP_B, ... (null in knockout)
    private String venue;
    private FdTeamDto homeTeam;
    private FdTeamDto awayTeam;
    private FdScoreDto score;
}
