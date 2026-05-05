package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdScoreDto {

    private String winner;
    private FdScoreValue fullTime;
    private FdScoreValue halfTime;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FdScoreValue {
        private Integer home;
        private Integer away;
    }
}
