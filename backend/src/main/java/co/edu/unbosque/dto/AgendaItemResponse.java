package co.edu.unbosque.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgendaItemResponse {
    private Integer id;
    private String titulo;
    private String descripcion;
    private String tipo;
    private String prioridad;
    private String fechaInicio;
    private String fechaFin;
    private Long apiPartidoId;
    private String ubicacion;
}
