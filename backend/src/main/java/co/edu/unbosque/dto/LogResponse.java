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
public class LogResponse {
    private Integer id;
    private String accion;
    private LocalDateTime timestamp;
    private String detalle;
    private String hashIntegridad;
    private String nivelRiesgo;
    private Boolean verificadoCompliance;
}