package co.edu.unbosque.controller;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.FcmTokenRequest;
import co.edu.unbosque.dto.NotificacionResponse;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.NotificacionRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.service.FcmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final FcmService             fcmService;
    private final UsuarioRepository      usuarioRepository;
    private final NotificacionRepository notificacionRepository;

    // ── Token management ──────────────────────────────────────────────────────

    /**
     * Register (or update) the FCM device token for the authenticated user.
     * Also auto-subscribes the device to the "partidos" broadcast topic.
     */
    @PostMapping("/token")
    @Transactional
    public ResponseEntity<?> registerToken(
            @Valid @RequestBody FcmTokenRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        Usuario usuario = getUsuario(userDetails);
        usuario.setFcmToken(req.getToken());
        usuarioRepository.save(usuario);

        fcmService.subscribeToTopic(req.getToken(), "partidos");

        return ResponseEntity.ok(ApiResponse.success(
                "Token registrado. Notificaciones activadas.", null));
    }

    /**
     * Remove the FCM token — user opts out of push notifications.
     */
    @DeleteMapping("/token")
    @Transactional
    public ResponseEntity<?> removeToken(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        usuario.setFcmToken(null);
        usuarioRepository.save(usuario);
        return ResponseEntity.ok(ApiResponse.success("Notificaciones desactivadas.", null));
    }

    /**
     * Check whether the current user has an FCM token registered.
     */
    @GetMapping("/has-token")
    @Transactional(readOnly = true)
    public ResponseEntity<?> hasToken(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        boolean has = usuario.getFcmToken() != null;
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasToken", has), "Estado del token"));
    }

    // ── Test & history ────────────────────────────────────────────────────────

    /**
     * Send a test push notification to the authenticated user's device.
     */
    @PostMapping("/test")
    @Transactional(readOnly = true)
    public ResponseEntity<?> sendTest(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        if (usuario.getFcmToken() == null) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Sin token FCM. Activa las notificaciones primero.", "NO_TOKEN"));
        }
        fcmService.sendToToken(usuario.getFcmToken(),
                "🔔 WC 2026 — Prueba",
                "Las notificaciones push están activas ✅");
        return ResponseEntity.ok(ApiResponse.success("Notificación de prueba enviada.", null));
    }

    /**
     * Retrieve the in-app notification history for the authenticated user.
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Usuario getUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}
