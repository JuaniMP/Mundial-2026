package co.edu.unbosque.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull(message = "El ID del partido es requerido")
    private Integer partidoId;

    @NotBlank(message = "La categoría es requerida")
    private String categoria; // GENERAL | VIP | PALCO

    @NotNull
    @Min(value = 1, message = "Mínimo 1 entrada")
    @Max(value = 4, message = "Máximo 4 entradas por compra")
    private Integer cantidad;

    /** Opcional — si no se envía se usa el email del usuario autenticado */
    private String emailComprador;
}
