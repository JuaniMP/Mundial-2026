package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrediccionResponse {
    private Integer id;
    private Integer golesLocal;
    private Integer golesVisitante;
    private Integer puntosObtenidos;
    private Integer idUsuario;
    private String nombreUsuario;
    /** ID del partido en football-data.org */
    private Long apiPartidoId;
}
