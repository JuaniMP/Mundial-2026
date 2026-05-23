package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoMasivoRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoProgreso;
import co.edu.unbosque.entity.Notificacion;
import co.edu.unbosque.entity.Prediccion;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.NotificacionRepository;
import co.edu.unbosque.repository.PrediccionRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Caso de Uso 10: Comunicados masivos segmentados.
 * El Admin redacta un mensaje y elige el segmento. El backend procesa el envío
 * en lotes de 100 destinatarios de forma asíncrona, y el frontend hace polling
 * al progreso vía {@link #obtenerProgreso(String)}.
 */
@Service
@RequiredArgsConstructor
public class ComunicadosMasivosService {

    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final PrediccionRepository prediccionRepository;
    private final AuditLogger auditLogger;

    /** Tracking en memoria; suficiente para una sola instancia. Migrar a Redis si se escala. */
    private final Map<String, ComunicadoProgreso> progreso = new ConcurrentHashMap<>();

    @Transactional
    public ComunicadoProgreso enviar(Integer adminId, ComunicadoMasivoRequest req) {
        String trackingId = UUID.randomUUID().toString();
        List<Usuario> destinatarios = resolverSegmento(req.getSegmento(), req.getSegmentoValor());
        ComunicadoProgreso prog = ComunicadoProgreso.builder()
                .id(trackingId)
                .totalDestinatarios(destinatarios.size())
                .enviados(0)
                .fallidos(0)
                .estado(destinatarios.isEmpty() ? "COMPLETADO" : "EN_PROCESO")
                .iniciadoEn(LocalDateTime.now().toString())
                .build();
        progreso.put(trackingId, prog);

        Usuario admin = usuarioRepository.findById(adminId).orElse(null);
        auditLogger.log("COMUNICADO_MASIVO", admin,
                "Envío masivo iniciado: " + req.getTitulo() + " segmento=" + req.getSegmento()
                        + " valor=" + req.getSegmentoValor()
                        + " destinatarios=" + destinatarios.size(),
                "BAJA");

        if (!destinatarios.isEmpty()) {
            procesarEnviosAsync(trackingId, destinatarios, req.getTitulo(), req.getMensaje());
        }
        return prog;
    }

    @Async
    public void procesarEnviosAsync(String trackingId, List<Usuario> destinatarios,
                                     String titulo, String mensaje) {
        int batchSize = 100;
        for (int i = 0; i < destinatarios.size(); i += batchSize) {
            List<Usuario> batch = destinatarios.subList(i,
                    Math.min(i + batchSize, destinatarios.size()));
            for (Usuario u : batch) {
                try {
                    Notificacion n = Notificacion.builder()
                            .mensaje("[" + titulo + "] " + mensaje)
                            .canal("APP")
                            .fechaEnvio(LocalDateTime.now())
                            .destinatario(u)
                            .build();
                    notificacionRepository.save(n);
                    ComunicadoProgreso p = progreso.get(trackingId);
                    if (p != null) p.setEnviados(p.getEnviados() + 1);
                } catch (Exception e) {
                    ComunicadoProgreso p = progreso.get(trackingId);
                    if (p != null) p.setFallidos(p.getFallidos() + 1);
                }
            }
            try {
                Thread.sleep(150);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        ComunicadoProgreso p = progreso.get(trackingId);
        if (p != null) {
            p.setEstado("COMPLETADO");
            p.setFinalizadoEn(LocalDateTime.now().toString());
        }
    }

    public ComunicadoProgreso obtenerProgreso(String trackingId) {
        ComunicadoProgreso p = progreso.get(trackingId);
        if (p == null) throw new ResourceNotFoundException("Tracking no encontrado: " + trackingId);
        return p;
    }

    private List<Usuario> resolverSegmento(String segmento, String valor) {
        if (segmento == null) return List.of();
        switch (segmento.toUpperCase()) {
            case "TODOS":
                return usuarioRepository.findAll();
            case "CIUDAD":
                if (valor == null || valor.isBlank()) return List.of();
                return usuarioRepository.findByCiudadIgnoreCase(valor);
            case "ROL":
                if (valor == null || valor.isBlank()) return List.of();
                return usuarioRepository.findAll().stream()
                        .filter(u -> u.getRol() != null
                                && valor.equalsIgnoreCase(u.getRol().getNombre()))
                        .collect(Collectors.toList());
            case "PARTIDO":
                if (valor == null || valor.isBlank()) return List.of();
                try {
                    long apiId = Long.parseLong(valor);
                    return prediccionRepository.findByApiPartidoId(apiId).stream()
                            .map(Prediccion::getUsuario)
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
                    return List.of();
                }
            default:
                return List.of();
        }
    }
}
