package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resultado del buscador centralizado de soporte: identifica al aficionado
 * (por ID, correo o ID de transacción) y entrega el contexto necesario para
 * la línea de tiempo y el panel de acciones correctivas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoporteBusquedaResponse {
    private Integer usuarioId;
    private String nombre;
    private String email;
    private String rol;
    private String seleccionFavorita;
    private String zonaHoraria;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoLogin;

    private int totalEntradas;
    private int totalIncidentes;
    private int totalLogs;

    private List<SoporteEntradaResumen> entradas;
}
