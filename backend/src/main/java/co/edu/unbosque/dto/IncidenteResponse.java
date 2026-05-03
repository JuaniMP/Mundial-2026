package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidenteResponse {
    private Integer id;
    private String descripcion;
    private String estado;
    private String prioridad;
    private Integer idReportador;
    private String nombreReportador;
    private Integer idAgente;
    private LocalDateTime fechaCreacion;
}