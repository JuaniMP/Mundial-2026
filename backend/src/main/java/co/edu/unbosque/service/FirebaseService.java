package co.edu.unbosque.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Servicio para enviar notificaciones push via Firebase Cloud Messaging (FCM).
 *
 * Configuración (en application.properties / variables de entorno):
 *   firebase.enabled=true
 *   firebase.service-account-json=<JSON completo del service account>
 *       ó
 *   firebase.service-account-file=<ruta al archivo .json>
 *
 * Si firebase.enabled=false (por defecto) el servicio se inicializa en modo
 * "solo log" y sendPush() es un no-op seguro.
 */
@Service
@Slf4j
public class FirebaseService {

    @Value("${firebase.enabled:false}")
    private boolean enabled;

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @Value("${firebase.service-account-file:}")
    private String serviceAccountFile;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Firebase: deshabilitado (firebase.enabled=false). "
                    + "Push notifications no se enviarán.");
            return;
        }

        // Evitar doble inicialización si FirebaseApp ya existe (e.g. hot-reload)
        if (!FirebaseApp.getApps().isEmpty()) {
            initialized = true;
            log.info("Firebase: ya inicializado, reutilizando instancia.");
            return;
        }

        try {
            InputStream is = resolveCredentials();
            if (is == null) {
                log.warn("Firebase: no se encontró service account (ni JSON ni archivo). "
                        + "Push desactivado.");
                return;
            }
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(is))
                    .build();
            FirebaseApp.initializeApp(options);
            initialized = true;
            log.info("Firebase Admin SDK inicializado correctamente.");
        } catch (Exception e) {
            log.error("Firebase: error al inicializar — {}. Push desactivado.", e.getMessage(), e);
        }
    }

    /**
     * Envía una notificación push al token FCM indicado.
     *
     * @param fcmToken  Token del dispositivo/navegador destino
     * @param title     Título de la notificación
     * @param body      Cuerpo del mensaje
     * @return true si el envío fue exitoso, false si falló o está desactivado
     */
    public boolean sendPush(String fcmToken, String title, String body) {
        if (!initialized || fcmToken == null || fcmToken.isBlank()) {
            return false;
        }
        try {
            Message msg = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setToken(fcmToken)
                    .build();
            String messageId = FirebaseMessaging.getInstance().send(msg);
            log.debug("FCM push enviado. messageId={}", messageId);
            return true;
        } catch (Exception e) {
            log.warn("FCM: error al enviar push a token={}... — {}",
                    fcmToken.length() > 10 ? fcmToken.substring(0, 10) : fcmToken,
                    e.getMessage());
            return false;
        }
    }

    public boolean isInitialized() {
        return initialized;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private InputStream resolveCredentials() {
        // 1) JSON inline (variable de entorno)
        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            log.info("Firebase: usando service account JSON inline.");
            return new ByteArrayInputStream(
                    serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }
        // 2) Ruta al archivo
        if (serviceAccountFile != null && !serviceAccountFile.isBlank()) {
            try {
                log.info("Firebase: usando service account file '{}'.", serviceAccountFile);
                return new FileInputStream(serviceAccountFile);
            } catch (Exception e) {
                log.warn("Firebase: no se pudo leer el archivo '{}' — {}",
                        serviceAccountFile, e.getMessage());
            }
        }
        return null;
    }
}
