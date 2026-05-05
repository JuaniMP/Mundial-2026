package co.edu.unbosque.service;

import co.edu.unbosque.entity.Notificacion;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.NotificacionRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class FcmService {

    private final NotificacionRepository notificacionRepository;

    // ── Internal check ────────────────────────────────────────────────────────

    private boolean isReady() {
        return !FirebaseApp.getApps().isEmpty();
    }

    // ── Core send methods ─────────────────────────────────────────────────────

    /**
     * Send a push notification to a single FCM device token.
     */
    public void sendToToken(String token, String title, String body) {
        if (!isReady() || token == null || token.isBlank()) {
            log.debug("FCM not ready or no token — skip sendToToken");
            return;
        }
        try {
            Message msg = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("title", title)
                    .putData("body", body)
                    .setToken(token)
                    .build();
            String response = FirebaseMessaging.getInstance().send(msg);
            log.info("📱 FCM sent to token → {}", response);
        } catch (FirebaseMessagingException e) {
            log.error("❌ FCM sendToToken failed: {}", e.getMessage());
        }
    }

    /**
     * Broadcast to a topic (all subscribed devices).
     */
    public void sendToTopic(String topic, String title, String body) {
        if (!isReady()) {
            log.debug("FCM not ready — skip sendToTopic '{}'", topic);
            return;
        }
        try {
            Message msg = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putData("title", title)
                    .putData("body", body)
                    .setTopic(topic)
                    .build();
            String response = FirebaseMessaging.getInstance().send(msg);
            log.info("📡 FCM sent to topic '{}' → {}", topic, response);
        } catch (FirebaseMessagingException e) {
            log.error("❌ FCM sendToTopic '{}' failed: {}", topic, e.getMessage());
        }
    }

    /**
     * Subscribe a token to a topic.
     */
    public void subscribeToTopic(String token, String topic) {
        if (!isReady() || token == null || token.isBlank()) return;
        try {
            TopicManagementResponse res = FirebaseMessaging.getInstance()
                    .subscribeToTopic(List.of(token), topic);
            log.info("📢 Subscribed token to topic '{}': {} success, {} fail",
                    topic, res.getSuccessCount(), res.getFailureCount());
        } catch (FirebaseMessagingException e) {
            log.error("❌ subscribeToTopic '{}' failed: {}", topic, e.getMessage());
        }
    }

    // ── Domain helpers ────────────────────────────────────────────────────────

    /**
     * Notify the buyer after a successful Stripe payment.
     * Also persists the notification in the DB.
     */
    public void notifyTicketPurchase(Usuario usuario, String partidoDesc,
                                     String categoria, int cantidad) {
        String title = "🎫 ¡Entrada confirmada!";
        String body  = cantidad + "x " + categoria + " — " + partidoDesc;

        persistNotificacion(usuario, title + " " + body, "FCM");

        if (usuario != null && usuario.getFcmToken() != null) {
            sendToToken(usuario.getFcmToken(), title, body);
        }
    }

    /**
     * Broadcast match result to all users subscribed to the "partidos" topic.
     */
    public void notifyMatchResult(String localPais, String visitantePais,
                                  int gLocal, int gVisitante) {
        String title = "⚽ Resultado: " + localPais + " vs " + visitantePais;
        String body  = gLocal + " - " + gVisitante;
        sendToTopic("partidos", title, body);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void persistNotificacion(Usuario destinatario, String mensaje, String canal) {
        if (destinatario == null) return;
        try {
            notificacionRepository.save(Notificacion.builder()
                    .mensaje(mensaje)
                    .canal(canal)
                    .destinatario(destinatario)
                    .build());
        } catch (Exception e) {
            log.warn("Could not persist notification: {}", e.getMessage());
        }
    }
}
