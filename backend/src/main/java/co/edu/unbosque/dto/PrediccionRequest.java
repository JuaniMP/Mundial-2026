package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrediccionRequest {
    private Integer idPolla;
    /** ID del partido en football-data.org */
    private Long apiPartidoId;
    private Integer golesLocal;
    private Integer golesVisitante;
    /** ISO-8601 del kickoff (ej. 2026-06-11T14:00:00Z). Si null, no se aplica candado. */
    private String fechaPartido;
}
