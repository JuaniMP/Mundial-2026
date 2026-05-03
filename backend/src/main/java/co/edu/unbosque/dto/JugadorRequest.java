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
public class JugadorRequest {
    private String nombreCompleto;
    private String posicion;
    private Integer dorsal;
    private LocalDate fechaNacimiento;
    private String nacionalidad;
    private String fotoUrl;
    private Integer idSeleccion;
}