package co.edu.unbosque.service;

import co.edu.unbosque.config.CorrelationIdFilter;
import co.edu.unbosque.entity.LogsTransaccional;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.LogsTransaccionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;

/**
 * Servicio de auditoría: persiste eventos del sistema en
 * {@code logs_transaccionales} enriquecidos con el {@code correlationId}
 * del request actual, de modo que la línea de tiempo de soporte pueda
 * reconstruir el flujo completo de un aficionado.
 *
 * <p>Nunca lanza excepciones: un fallo de auditoría jamás debe romper
 * un flujo de negocio (login, pago, etc.).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionLogService {

    private final LogsTransaccionalRepository logRepository;

    /** Registra un evento usando el correlationId del request actual (MDC). */
    public void registrar(Usuario usuario, String accion, String detalle, String nivelRiesgo) {
        registrar(usuario, accion, detalle, nivelRiesgo, null);
    }

    /**
     * Registra un evento en el log transaccional.
     *
     * @param correlationIdExplicito si es {@code null} se toma el del MDC;
     *        para eventos de pago conviene pasar el {@code paymentIntentId}
     *        para que checkout, webhook y correos compartan la misma traza.
     */
    public void registrar(Usuario usuario, String accion, String detalle,
                          String nivelRiesgo, String correlationIdExplicito) {
        try {
            if (usuario == null) return; // eventos de invitados no se asocian a un usuario

            String correlationId = correlationIdExplicito != null
                    ? correlationIdExplicito
                    : MDC.get(CorrelationIdFilter.MDC_KEY);

            LogsTransaccional entry = LogsTransaccional.builder()
                    .accion(accion)
                    .detalle(detalle)
                    .correlationId(correlationId)
                    .hashIntegridad(hash(accion + System.currentTimeMillis()))
                    .nivelRiesgo(nivelRiesgo != null ? nivelRiesgo : "BAJO")
                    .verificadoCompliance(false)
                    .usuario(usuario)
                    .build();

            logRepository.save(entry);
        } catch (Exception e) {
            log.warn("No se pudo registrar log transaccional [{}]: {}", accion, e.getMessage());
        }
    }

    private String hash(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(data.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "HASH_ERROR";
        }
    }
}
