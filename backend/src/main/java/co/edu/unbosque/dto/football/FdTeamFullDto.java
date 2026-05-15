package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdTeamFullDto {
    private Long id;
    private String name;
    private String shortName;
    private String tla;           // código FIFA 3 letras (ej: "BRA")
    private String crest;         // URL escudo
    private String address;
    private String website;
    private Integer founded;
    private String clubColors;
    private String venue;         // nombre del estadio
    private List<FdPlayerDto> squad;
    private FdCoachDto coach;
}
