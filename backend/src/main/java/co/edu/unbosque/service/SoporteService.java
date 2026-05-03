package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoporteService {

    private final IncidenteSoporteRepository incidenteRepository;
    private final LogsTransaccionalRepository logRepository;
    private final NotificacionRepository notificacionRepository;
    private final AliadoComercialRepository aliadoRepository;
    private final ReporteInteraccionAPIRepository reporteAPIRepository;
    private final ReporteComplianceRepository reporteComplianceRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public IncidenteResponse crearIncidente(IncidenteRequest request, Integer reportadorId) {
        Usuario reportador = usuarioRepository.findById(reportadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        IncidenteSoporte incidente = IncidenteSoporte.builder()
                .descripcion(request.getDescripcion())
                .estado("ABIERTO")
                .prioridad(request.getPrioridad())
                .reportador(reportador)
                .build();

        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    public List<IncidenteResponse> getIncidentesAbiertos() {
        return incidenteRepository.findByEstado("ABIERTO").stream()
                .map(this::toIncidenteResponse)
                .collect(Collectors.toList());
    }

    public List<IncidenteResponse> getIncidentesByAgente(Integer agenteId) {
        return incidenteRepository.findByAgenteSoporteId(agenteId).stream()
                .map(this::toIncidenteResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidenteResponse asignarAgente(Integer incidenteId, Integer agenteId) {
        IncidenteSoporte incidente = incidenteRepository.findById(incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado"));

        Usuario agente = usuarioRepository.findById(agenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Agente no encontrado"));

        incidente.setAgenteSoporte(agente);
        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    @Transactional
    public IncidenteResponse resolverIncidente(Integer incidenteId, String resolucion) {
        IncidenteSoporte incidente = incidenteRepository.findById(incidenteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente no encontrado"));

        incidente.setEstado("RESUELTO");
        incidente.setDescripcion(incidente.getDescripcion() + "\n\nResolución: " + resolucion);
        incidente = incidenteRepository.save(incidente);
        return toIncidenteResponse(incidente);
    }

    @Transactional
    public LogResponse crearLog(LogRequest request, Integer usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String hash = generateHash(request.getAccion() + System.currentTimeMillis());

        LogsTransaccional log = LogsTransaccional.builder()
                .accion(request.getAccion())
                .detalle(request.getDetalle())
                .hashIntegridad(hash)
                .nivelRiesgo(request.getNivelRiesgo() != null ? request.getNivelRiesgo() : "BAJO")
                .verificadoCompliance(false)
                .usuario(usuario)
                .build();

        log = logRepository.save(log);
        return toLogResponse(log);
    }

    public List<LogResponse> getLogsByUsuario(Integer usuarioId) {
        return logRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toLogResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificacionResponse crearNotificacion(NotificacionRequest request) {
        Usuario destinatario = usuarioRepository.findById(request.getIdDestinatario())
                .orElseThrow(() -> new ResourceNotFoundException("Destinatario no encontrado"));

        Usuario emisor = null;
        if (request.getIdEmisor() != null) {
            emisor = usuarioRepository.findById(request.getIdEmisor()).orElse(null);
        }

        Notificacion notificacion = Notificacion.builder()
                .mensaje(request.getMensaje())
                .canal(request.getCanal())
                .destinatario(destinatario)
                .emisor(emisor)
                .build();

        notificacion = notificacionRepository.save(notificacion);
        return toNotificacionResponse(notificacion);
    }

    public List<NotificacionResponse> getNotificacionesByUsuario(Integer usuarioId) {
        return notificacionRepository.findByDestinatarioId(usuarioId).stream()
                .map(this::toNotificacionResponse)
                .collect(Collectors.toList());
    }

    private String generateHash(String data) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = md.digest(data.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "HASH_ERROR";
        }
    }

    private IncidenteResponse toIncidenteResponse(IncidenteSoporte i) {
        return IncidenteResponse.builder()
                .id(i.getId())
                .descripcion(i.getDescripcion())
                .estado(i.getEstado())
                .prioridad(i.getPrioridad())
                .idReportador(i.getReportador().getId())
                .nombreReportador(i.getReportador().getNombre())
                .idAgente(i.getAgenteSoporte() != null ? i.getAgenteSoporte().getId() : null)
                .fechaCreacion(i.getFechaCreacion())
                .build();
    }

    private LogResponse toLogResponse(LogsTransaccional l) {
        return LogResponse.builder()
                .id(l.getId())
                .accion(l.getAccion())
                .timestamp(l.getTimestamp())
                .detalle(l.getDetalle())
                .hashIntegridad(l.getHashIntegridad())
                .nivelRiesgo(l.getNivelRiesgo())
                .verificadoCompliance(l.getVerificadoCompliance())
                .build();
    }

    private NotificacionResponse toNotificacionResponse(Notificacion n) {
        return NotificacionResponse.builder()
                .id(n.getId())
                .mensaje(n.getMensaje())
                .canal(n.getCanal())
                .idDestinatario(n.getDestinatario().getId())
                .idEmisor(n.getEmisor() != null ? n.getEmisor().getId() : null)
                .fechaEnvio(n.getFechaEnvio())
                .build();
    }
}