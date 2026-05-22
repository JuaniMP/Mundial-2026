package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Un evento de la línea de tiempo de un aficionado. La vista de soporte
 * renderiza una lista cronológica de estos eventos, fusionando logs
 * transaccionales, entradas, notificaciones e incidentes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventResponse {
    private LocalDateTime timestamp;
    /** LOGIN | RESERVA | PAGO_OK | PAGO_ERROR | REEMBOLSO | EMAIL | INCIDENTE | ACCION_SOPORTE | GENERICO */
    private String tipo;
    private String titulo;
    private String detalle;
    private String correlationId;
    /** INFO | WARN | ERROR */
    private String severidad;
    /** ID de la entidad relacionada (entrada, incidente…) si aplica. */
    private Integer referenciaId;
}
