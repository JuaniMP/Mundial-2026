package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaminaAlbumResponse {
    private Integer idLamina;
    private String nombreJugador;
    private String rareza;
    private Boolean estaPegada;
    private Integer cantidadRepetidas;
}