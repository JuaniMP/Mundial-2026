package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {

    /** Stripe client secret — enviado al frontend para confirmar el pago */
    private String clientSecret;

    /** ID del PaymentIntent en Stripe */
    private String paymentIntentId;

    /** Total a cobrar en USD */
    private BigDecimal totalUsd;

    /** Número de entradas */
    private Integer cantidad;

    /** Categoría seleccionada */
    private String categoria;

    /** IDs de las Entrada registradas en BD */
    private List<Integer> entradaIds;

    /** Partido al que corresponden */
    private String partidoDescripcion;
}
