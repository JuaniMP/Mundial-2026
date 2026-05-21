package co.edu.unbosque.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasRequest {
    private List<String> seleccionesFavoritas;
    private List<String> estadiosFavoritos;
    /** APP, EMAIL, PUSH, SMS */
    private List<String> canalesNotificacion;
    private String zonaHorariaPreferida;
    private Boolean wizardCompletado;
}
