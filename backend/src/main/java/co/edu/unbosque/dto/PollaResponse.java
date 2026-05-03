package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollaResponse {
    private Integer id;
    private String nombre;
    private String codigoAcceso;
    private Integer pozoPuntos;
    private Integer idCreador;
    private String nombreCreador;
}