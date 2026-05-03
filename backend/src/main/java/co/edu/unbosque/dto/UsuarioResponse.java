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
public class UsuarioResponse {
    private Integer id;
    private String nombre;
    private String email;
    private String zonaHoraria;
    private String seleccionFavorita;
    private String rol;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoLogin;
}