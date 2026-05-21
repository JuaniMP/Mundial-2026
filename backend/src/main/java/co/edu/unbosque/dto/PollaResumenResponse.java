package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollaResumenResponse {
    private Integer id;
    private String nombre;
    private String codigoAcceso;
    private Integer pozoPuntos;
    private String nombreCreador;
    private Integer totalParticipantes;
    private Integer misPuntos;
    private Integer miPosicion;
    private boolean soyCreador;
}
