package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdCoachDto {
    private Long id;
    private String name;
    private String dateOfBirth;
    private String nationality;
}
