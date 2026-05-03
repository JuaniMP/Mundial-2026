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
public class PartidoResponse {
    private Integer id;
    private LocalDateTime fechaHora;
    private String ronda;
    private String estado;
    private Integer marcadorLocal;
    private Integer marcadorVisitante;
    private Integer idEstadio;
    private String estadioNombre;
    private Integer idSeleccionLocal;
    private String seleccionLocal;
    private Integer idSeleccionVisitante;
    private String seleccionVisitante;
}