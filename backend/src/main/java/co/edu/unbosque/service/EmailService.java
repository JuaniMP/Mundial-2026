package co.edu.unbosque.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String email, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@mundialwc2026.com");
            message.setTo(email);
            message.setSubject("Restablecer contraseña - FIFA World Cup 2026");
            message.setText(
                "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña.\n" +
                "Tu código de verificación es: " + resetCode + "\n\n" +
                "Este código expirará en 24 horas.\n\n" +
                "Si no solicitaste este cambio, ignora este correo.\n\n" +
                "Saludos,\n" +
                "Equipo de FIFA World Cup 2026"
            );

            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Error sending password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Reenvía la confirmación de una entrada. Usado por el panel de soporte
     * cuando al aficionado no le llegó el correo original.
     */
    public void sendTicketConfirmationEmail(String email, String codigoQr,
                                            String partido, String categoria) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@mundialwc2026.com");
            message.setTo(email);
            message.setSubject("Confirmación de tu entrada - FIFA World Cup 2026");
            message.setText(
                "Hola,\n\n" +
                "Aquí tienes nuevamente la confirmación de tu entrada para el Mundial FIFA 2026.\n\n" +
                "Partido:   " + (partido != null && !partido.isBlank() ? partido : "Por confirmar") + "\n" +
                "Categoría: " + categoria + "\n" +
                "Código QR: " + codigoQr + "\n\n" +
                "Presenta este código en el acceso al estadio.\n\n" +
                "Saludos,\n" +
                "Equipo de FIFA World Cup 2026"
            );

            mailSender.send(message);
            log.info("Ticket confirmation email sent to: {}", email);
        } catch (Exception e) {
            log.error("Error sending ticket confirmation email to: {}", email, e);
            throw new RuntimeException("Failed to send confirmation email", e);
        }
    }

    public void sendVerificationEmail(String email, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@mundialwc2026.com");
            message.setTo(email);
            message.setSubject("Verificar correo electrónico - FIFA World Cup 2026");
            message.setText(
                "Hola,\n\n" +
                "Bienvenido a FIFA World Cup 2026.\n" +
                "Tu código de verificación es: " + verificationCode + "\n\n" +
                "Este código expirará en 24 horas.\n\n" +
                "Saludos,\n" +
                "Equipo de FIFA World Cup 2026"
            );

            mailSender.send(message);
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.error("Error sending verification email to: {}", email, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
