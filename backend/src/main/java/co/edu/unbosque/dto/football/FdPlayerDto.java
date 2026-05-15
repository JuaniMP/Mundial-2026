package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdPlayerDto {
    private Long id;
    private String name;
    private String position;       // Goalkeeper, Defence, Midfield, Offence
    private String dateOfBirth;
    private String nationality;
    private Integer shirtNumber;
    private String marketValue;
}
