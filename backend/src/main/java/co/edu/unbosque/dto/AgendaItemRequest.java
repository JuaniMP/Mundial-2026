package co.edu.unbosque.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgendaItemRequest {
    private String titulo;
    private String descripcion;
    /** PARTIDO, VIAJE, ENTRADA, CUSTOM */
    private String tipo;
    /** ALTA, MEDIA, BAJA */
    private String prioridad;
    /** ISO-8601, ej. 2026-06-11T14:00:00 */
    private String fechaInicio;
    private String fechaFin;
    private Long apiPartidoId;
    private String ubicacion;
}
