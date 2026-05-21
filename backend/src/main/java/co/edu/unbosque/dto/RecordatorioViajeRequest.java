package co.edu.unbosque.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordatorioViajeRequest {
    private String ciudadDestino;
    private String paisDestino;
    private String zonaHorariaDestino;
    /** YYYY-MM-DD */
    private String fechaInicio;
    private String fechaFin;
    private String estadioDestino;
    private String notas;
}
