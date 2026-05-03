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
public class PartidoRequest {
    private LocalDateTime fechaHora;
    private String ronda;
    private Integer idEstadio;
    private Integer idSeleccionLocal;
    private Integer idSeleccionVisitante;
}