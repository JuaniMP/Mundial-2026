package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionResponse {
    private Integer id;
    private String mensaje;
    private String canal;
    private Integer idDestinatario;
    private Integer idEmisor;
    private LocalDateTime fechaEnvio;
}