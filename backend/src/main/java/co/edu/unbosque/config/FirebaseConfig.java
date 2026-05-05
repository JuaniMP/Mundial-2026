package co.edu.unbosque.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.enabled:false}")
    private boolean enabled;

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @PostConstruct
    public void init() {
        if (!enabled || serviceAccountJson == null || serviceAccountJson.isBlank()) {
            log.warn("⚠️  Firebase FCM disabled. Set FIREBASE_ENABLED=true and FIREBASE_SERVICE_ACCOUNT_JSON env vars.");
            return;
        }
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8))
                );
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("✅ Firebase Admin SDK initialized (FCM ready)");
            }
        } catch (Exception e) {
            log.error("❌ Firebase initialization failed: {}. FCM disabled.", e.getMessage());
        }
    }
}
