package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdTeamDto {
    private Long id;
    private String name;
    private String shortName;
    private String tla;
    private String crest;
}
