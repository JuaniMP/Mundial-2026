package co.edu.unbosque.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasResponse {
    private List<String> seleccionesFavoritas;
    private List<String> estadiosFavoritos;
    private List<String> canalesNotificacion;
    private String zonaHorariaPreferida;
    private boolean wizardCompletado;
    private String idioma;
}
