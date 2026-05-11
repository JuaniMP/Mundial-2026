package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JugadorResponse {
    private Integer id;
    private String nombreCompleto;
    private String posicion;
    private Integer dorsal;
    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private Integer minutosJugados;
    private Integer goles;
    private String fotoUrl;
    private Integer popularidad;
    private Integer idSeleccion;
    private String pais;
}