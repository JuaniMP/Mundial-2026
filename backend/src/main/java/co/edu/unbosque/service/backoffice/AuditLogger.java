package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.entity.LogsTransaccional;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.LogsTransaccionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Helper compartido por todos los services del Backoffice.
 * Registra una entrada en logs_transaccionales cada vez que un admin/compliance
 * ejecuta una acción crítica.
 */
@Component
@RequiredArgsConstructor
public class AuditLogger {

    private final LogsTransaccionalRepository logsRepository;

    public void log(String accion, Usuario u, String detalle, String nivelRiesgo) {
        if (u == null) return;
        LogsTransaccional log = LogsTransaccional.builder()
                .accion(accion)
                .timestamp(LocalDateTime.now())
                .detalle(detalle)
                .nivelRiesgo(nivelRiesgo)
                .verificadoCompliance(false)
                .usuario(u)
                .build();
        logsRepository.save(log);
    }
}
