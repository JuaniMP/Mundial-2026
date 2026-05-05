package co.edu.unbosque.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FcmTokenRequest {

    @NotBlank(message = "El token FCM no puede estar vacío")
    private String token;
}
