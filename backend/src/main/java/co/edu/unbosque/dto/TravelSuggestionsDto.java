package co.edu.unbosque.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TravelSuggestionsDto {
    private String estadio;
    private String ciudad;
    private String pais;
    private String iataCode;
    private String googleFlightsUrl;
    private String skyscannerUrl;
    private String bookingCiudadUrl;
    private List<HotelSuggestionDto> hoteles;
    private List<AtraccionDto> atracciones;
    private boolean apiFuncional; // false = datos de demo/fallback

    @Data
    @Builder
    public static class AtraccionDto {
        private String nombre;
        private String tipo;      // MUSEO, PARQUE, MONUMENTO, etc.
        private String emoji;
        private String descripcion;
        private String mapsUrl;
    }
}
