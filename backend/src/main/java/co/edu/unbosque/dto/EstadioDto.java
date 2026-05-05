package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadioDto {
    private Integer id;
    private String nombre;
    private String ciudad;
    private String pais;
    private Integer capacidad;
    private Double lat;
    private Double lng;
    private String direccion;
}
