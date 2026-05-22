package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Resumen de una entrada usado por el panel de acciones correctivas de soporte.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoporteEntradaResumen {
    private Integer entradaId;
    private String codigoQr;
    private String partido;
    private String categoria;
    private String estado;                 // PENDIENTE | PAGADO | FALLIDO | USADO | REEMBOLSADO
    private String stripeStatus;
    private String stripePaymentIntentId;
    private String emailComprador;
    private BigDecimal total;
    private LocalDateTime fechaCompra;
}
