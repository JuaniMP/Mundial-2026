package co.edu.unbosque.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedItemResponse {
    private String id;
    /** AGENDA, VIAJE, NOTIFICACION, POLLA */
    private String origen;
    private String titulo;
    private String detalle;
    private String prioridad;
    /** ISO-8601 */
    private String cuando;
    private String accionUrl;
}
