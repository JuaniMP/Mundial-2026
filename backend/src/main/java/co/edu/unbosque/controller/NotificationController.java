package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.FcmTokenRequest;
import co.edu.unbosque.dto.NotificacionResponse;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.NotificacionRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoints de notificaciones in-app del usuario autenticado.
 * También expone el endpoint para registrar el token FCM del navegador/dispositivo,
 * necesario para push notifications via Firebase.
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final UsuarioRepository      usuarioRepository;
    private final NotificacionRepository notificacionRepository;

    /**
     * Devuelve el historial de notificaciones del usuario autenticado,
     * ordenado de más reciente a más antiguo.
     */
    @GetMapping("/mis-notificaciones")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMisNotificaciones(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        List<NotificacionResponse> data = notificacionRepository
                .findByDestinatarioId(usuario.getId())
                .stream()
                .sorted((a, b) -> {
                    if (a.getFechaEnvio() == null || b.getFechaEnvio() == null) return 0;
                    return b.getFechaEnvio().compareTo(a.getFechaEnvio());
                })
                .map(n -> NotificacionResponse.builder()
                        .id(n.getId())
                        .mensaje(n.getMensaje())
                        .canal(n.getCanal())
                        .idDestinatario(usuario.getId())
                        .fechaEnvio(n.getFechaEnvio())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(data, "Notificaciones"));
    }

    /**
     * Registra o actualiza el token FCM del navegador/dispositivo del usuario autenticado.
     * El frontend llama a este endpoint después de obtener el token con getToken() de Firebase JS SDK.
     */
    @PostMapping("/fcm-token")
    @Transactional
    public ResponseEntity<?> registrarFcmToken(
            @Valid @RequestBody FcmTokenRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        usuario.setFcmToken(request.getToken());
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(ApiResponse.success(null, "Token FCM registrado"));
    }

    private Usuario getUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
