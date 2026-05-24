package co.edu.unbosque.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HotelSuggestionDto {
    private String hotelId;
    private String nombre;
    private String categoria;    // estrellas como texto "4 STARS"
    private Integer estrellas;
    private String ciudad;
    private String pais;
    private Double latitud;
    private Double longitud;
    private String bookingUrl;   // deep-link a booking.com ya pre-filtrado
    private String distanciaEstadio; // "~X km del estadio"
    private Boolean disponible;
}
