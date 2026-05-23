package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.LogResponse;
import co.edu.unbosque.dto.BackofficeDTOs.LogsFilterRequest;
import co.edu.unbosque.entity.LogsTransaccional;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.LogsTransaccionalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Consola de auditoría de logs (visión técnica a gran escala).
 * Permite filtros por acción, usuario, nivel de riesgo y rango de fechas.
 */
@Service
@RequiredArgsConstructor
public class LogsAuditoriaService {

    private final LogsTransaccionalRepository logsRepository;

    @Transactional(readOnly = true)
    public List<LogResponse> filtrar(LogsFilterRequest f) {
        LocalDateTime desde = parseDateTime(f.getDesde());
        LocalDateTime hasta = parseDateTime(f.getHasta());
        int page = f.getPage() == null ? 0 : f.getPage();
        int size = f.getSize() == null ? 50 : Math.min(f.getSize(), 200);

        return logsRepository.findAll().stream()
                .filter(l -> f.getTipo() == null || f.getTipo().isBlank()
                        || (l.getAccion() != null
                            && l.getAccion().toLowerCase().contains(f.getTipo().toLowerCase())))
                .filter(l -> f.getUsuarioId() == null
                        || (l.getUsuario() != null && l.getUsuario().getId().equals(f.getUsuarioId())))
                .filter(l -> f.getNivelRiesgo() == null || f.getNivelRiesgo().isBlank()
                        || (l.getNivelRiesgo() != null
                            && l.getNivelRiesgo().equalsIgnoreCase(f.getNivelRiesgo())))
                .filter(l -> desde == null
                        || (l.getTimestamp() != null && !l.getTimestamp().isBefore(desde)))
                .filter(l -> hasta == null
                        || (l.getTimestamp() != null && !l.getTimestamp().isAfter(hasta)))
                .sorted(Comparator.comparing(LogsTransaccional::getTimestamp,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .skip((long) page * size)
                .limit(size)
                .map(this::toLog)
                .collect(Collectors.toList());
    }

    private LogResponse toLog(LogsTransaccional l) {
        Usuario u = l.getUsuario();
        return LogResponse.builder()
                .id(l.getId())
                .accion(l.getAccion())
                .timestamp(l.getTimestamp() == null ? null : l.getTimestamp().toString())
                .detalle(l.getDetalle())
                .nivelRiesgo(l.getNivelRiesgo())
                .verificadoCompliance(Boolean.TRUE.equals(l.getVerificadoCompliance()))
                .usuarioId(u == null ? null : u.getId())
                .usuarioNombre(u == null ? null : u.getNombre())
                .hashIntegridad(l.getHashIntegridad())
                .build();
    }

    private LocalDateTime parseDateTime(String iso) {
        if (iso == null || iso.isBlank()) return null;
        try {
            return LocalDateTime.parse(iso);
        } catch (Exception e) {
            try {
                return LocalDate.parse(iso).atStartOfDay();
            } catch (Exception e2) {
                return null;
            }
        }
    }
}
