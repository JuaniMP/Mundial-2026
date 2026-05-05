package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdMatchesApiResponse {
    private List<FdMatchDto> matches;
}
