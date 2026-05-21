package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingEntryResponse {
    private Integer posicion;
    private Integer idUsuario;
    private String nombreUsuario;
    private String email;
    private String seleccionFavorita;
    private Integer puntos;
    private Integer totalPredicciones;
    private Integer aciertosExactos;
    /** Premio si aplica: ORO, PLATA, BRONCE, null */
    private String premio;
}
