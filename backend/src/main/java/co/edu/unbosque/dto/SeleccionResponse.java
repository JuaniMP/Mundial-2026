package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeleccionResponse {
    private Integer id;
    private String pais;
    private String codigoFifa;
    private String confederacion;
    private String grupo;
    private String historial;
    private String banderaUrl;
}