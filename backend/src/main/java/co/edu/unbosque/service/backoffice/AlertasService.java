package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.AlertaResponse;
import co.edu.unbosque.entity.LogsTransaccional;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.LogsTransaccionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Vista de alertas tempranas anti-fraude para Compliance.
 * Los datos provienen de logs_transaccionales con nivelRiesgo ALTA o MEDIA
 * que aún no han sido marcados como verificadoCompliance=true.
 */
@Service
@RequiredArgsConstructor
public class AlertasService {

    private final LogsTransaccionalRepository logsRepository;

    @Transactional(readOnly = true)
    public List<AlertaResponse> listar(boolean soloAbiertas) {
        return logsRepository.findAll().stream()
                .filter(l -> l.getNivelRiesgo() != null
                        && (l.getNivelRiesgo().equalsIgnoreCase("ALTA")
                            || l.getNivelRiesgo().equalsIgnoreCase("MEDIA")))
                .filter(l -> !soloAbiertas || !Boolean.TRUE.equals(l.getVerificadoCompliance()))
                .sorted(Comparator.comparing(LogsTransaccional::getTimestamp,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(200)
                .map(this::toAlerta)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlertaResponse marcarRevisada(Integer alertaId, boolean revisada) {
        LogsTransaccional log = logsRepository.findById(alertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada"));
        log.setVerificadoCompliance(revisada);
        logsRepository.save(log);
        return toAlerta(log);
    }

    private AlertaResponse toAlerta(LogsTransaccional l) {
        Usuario u = l.getUsuario();
        return AlertaResponse.builder()
                .id(l.getId())
                .tipo(l.getAccion())
                .severidad(l.getNivelRiesgo())
                .descripcion(l.getDetalle())
                .usuarioId(u == null ? null : u.getId())
                .usuarioNombre(u == null ? null : u.getNombre())
                .usuarioEmail(u == null ? null : u.getEmail())
                .timestamp(l.getTimestamp() == null ? null : l.getTimestamp().toString())
                .revisada(Boolean.TRUE.equals(l.getVerificadoCompliance()))
                .build();
    }
}
