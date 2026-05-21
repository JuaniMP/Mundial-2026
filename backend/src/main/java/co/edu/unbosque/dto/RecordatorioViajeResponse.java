package co.edu.unbosque.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordatorioViajeResponse {
    private Integer id;
    private String ciudadDestino;
    private String paisDestino;
    private String zonaHorariaDestino;
    private String fechaInicio;
    private String fechaFin;
    private String estadioDestino;
    private String notas;
    /** Diferencia horaria respecto a la zona del usuario (ej. "+3h", "-2h"). */
    private String offsetHoras;
    /** Si la fecha actual está dentro del rango del viaje. */
    private boolean enCurso;
    /** Mensaje contextual: ej "Llegas mañana a Nueva York. UTC-5." */
    private String alerta;
}
