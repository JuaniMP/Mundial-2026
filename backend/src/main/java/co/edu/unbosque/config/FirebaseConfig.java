package co.edu.unbosque.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${firebase.enabled:false}")
    private boolean enabled;

    /** JSON content inline (env var FIREBASE_SERVICE_ACCOUNT_JSON). */
    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    /** Path to the service account JSON file (env var FIREBASE_SERVICE_ACCOUNT_FILE). */
    @Value("${firebase.service-account-file:}")
    private String serviceAccountFile;

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.warn("⚠️  Firebase FCM disabled. Set FIREBASE_ENABLED=true to activate push notifications.");
            return;
        }
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream credStream = resolveCredentialsStream();
                if (credStream == null) {
                    log.warn("⚠️  Firebase FCM disabled: no credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_FILE.");
                    return;
                }
                GoogleCredentials credentials = GoogleCredentials.fromStream(credStream);
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

    private InputStream resolveCredentialsStream() throws Exception {
        // 1. Try inline JSON content
        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            return new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }
        // 2. Try file path
        if (serviceAccountFile != null && !serviceAccountFile.isBlank()) {
            if (Files.exists(Paths.get(serviceAccountFile))) {
                log.info("Loading Firebase credentials from file: {}", serviceAccountFile);
                return new FileInputStream(serviceAccountFile);
            } else {
                log.warn("Firebase service account file not found: {}", serviceAccountFile);
            }
        }
        return null;
    }
}
