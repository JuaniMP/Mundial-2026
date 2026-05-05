package co.edu.unbosque.dto.football;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FdStandingsGroupDto {
    private String stage;
    private String type;
    private String group;   // "GROUP_A", "GROUP_B", ...
    private List<FdTableEntryDto> table;
}
