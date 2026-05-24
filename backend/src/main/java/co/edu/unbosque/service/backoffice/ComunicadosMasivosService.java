package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoMasivoRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ComunicadoProgreso;
import co.edu.unbosque.dto.football.FdMatchDto;
import co.edu.unbosque.dto.football.FdMatchesApiResponse;
import co.edu.unbosque.entity.Notificacion;
import co.edu.unbosque.entity.Prediccion;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.NotificacionRepository;
import co.edu.unbosque.repository.PrediccionRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.service.FirebaseService;
import co.edu.unbosque.service.FootballDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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
    private final FootballDataService footballDataService;
    private final AuditLogger auditLogger;
    private final FirebaseService firebaseService;

    /** Tracking en memoria; suficiente para una sola instancia. Migrar a Redis si se escala. */
    private final Map<String, ComunicadoProgreso> progreso = new ConcurrentHashMap<>();

    @Transactional
    public ComunicadoProgreso enviar(Integer adminId, ComunicadoMasivoRequest req) {
        String trackingId = UUID.randomUUID().toString();
        Set<String> canales = normalizarCanales(req.getCanales());
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
                        + " canales=" + String.join(",", canales)
                        + " destinatarios=" + destinatarios.size(),
                "BAJA");

        if (!destinatarios.isEmpty()) {
            procesarEnviosAsync(trackingId, destinatarios, req.getTitulo(), req.getMensaje(), canales);
        }
        return prog;
    }

    @Async
    public void procesarEnviosAsync(String trackingId, List<Usuario> destinatarios,
                                     String titulo, String mensaje, Set<String> canales) {
        int batchSize = 100;
        for (int i = 0; i < destinatarios.size(); i += batchSize) {
            List<Usuario> batch = destinatarios.subList(i,
                    Math.min(i + batchSize, destinatarios.size()));
            for (Usuario u : batch) {
                try {
                    boolean ok = enviarAUsuario(u, titulo, mensaje, canales);
                    ComunicadoProgreso p = progreso.get(trackingId);
                    if (p != null) {
                        if (ok) {
                            p.setEnviados(p.getEnviados() + 1);
                        } else {
                            p.setFallidos(p.getFallidos() + 1);
                        }
                    }
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

    /**
     * Envía el comunicado a un usuario por todos los canales indicados.
     * Siempre guarda en la BD (in-app), y si el usuario tiene token FCM y el
     * canal PUSH está activo también envía la notificación push via Firebase.
     */
    private boolean enviarAUsuario(Usuario destinatario, String titulo, String mensaje,
                                    Set<String> canales) {
        boolean ok = true;

        // Canal in-app: siempre guardamos en BD
        try {
            String canalDb = canales.contains("PUSH") ? "PUSH" : "APP";
            Notificacion n = Notificacion.builder()
                    .mensaje("[" + titulo + "] " + mensaje)
                    .canal(canalDb)
                    .fechaEnvio(LocalDateTime.now())
                    .destinatario(destinatario)
                    .build();
            notificacionRepository.save(n);
        } catch (Exception e) {
            ok = false;
        }

        // Canal PUSH: envío via Firebase FCM si el usuario tiene token
        if (canales.contains("PUSH")) {
            String fcmToken = destinatario.getFcmToken();
            if (fcmToken != null && !fcmToken.isBlank()) {
                boolean pushOk = firebaseService.sendPush(fcmToken, titulo, mensaje);
                if (!pushOk) {
                    // Push falló pero la notificación in-app ya fue guardada — no contamos como fallo total
                    // (el usuario lo verá en la campanita de todas formas)
                }
            }
        }

        return ok;
    }

    private Set<String> normalizarCanales(List<String> canalesReq) {
        Set<String> canales = new HashSet<>();
        if (canalesReq != null) {
            for (String canal : canalesReq) {
                if (canal == null) continue;
                String n = canal.trim().toUpperCase();
                if ("APP".equals(n) || "PUSH".equals(n)) {
                    canales.add(n);
                }
            }
        }
        if (canales.isEmpty()) {
            canales.add("PUSH");
        }
        return canales;
    }

    public ComunicadoProgreso obtenerProgreso(String trackingId) {
        ComunicadoProgreso p = progreso.get(trackingId);
        if (p == null) throw new ResourceNotFoundException("Tracking no encontrado: " + trackingId);
        return p;
    }

    private List<Usuario> resolverSegmento(String segmento, String valor) {
        if (segmento == null) return List.of();
        String valorLimpio = valor == null ? null : valor.trim();
        switch (segmento.toUpperCase()) {
            case "TODOS":
                return usuarioRepository.findAll();
            case "CIUDAD":
                if (valorLimpio == null || valorLimpio.isBlank()) return List.of();
                return usuarioRepository.findByCiudadIgnoreCase(valorLimpio);
            case "ROL":
                if (valorLimpio == null || valorLimpio.isBlank()) return List.of();
                return usuarioRepository.findAll().stream()
                        .filter(u -> u.getRol() != null
                                && valorLimpio.equalsIgnoreCase(u.getRol().getNombre()))
                        .collect(Collectors.toList());
            case "PARTIDO":
                if (valorLimpio == null || valorLimpio.isBlank()) return List.of();
                try {
                    long apiId = Long.parseLong(valorLimpio);
                    return prediccionRepository.findByApiPartidoId(apiId).stream()
                            .map(Prediccion::getUsuario)
                            .filter(Objects::nonNull)
                            .distinct()
                            .collect(Collectors.toList());
                } catch (NumberFormatException e) {
                    return List.of();
                }
            case "ESTADIO":
                if (valorLimpio == null || valorLimpio.isBlank()) return List.of();
                return resolverUsuariosPorEstadio(valorLimpio);
            default:
                return List.of();
        }
    }

    private List<Usuario> resolverUsuariosPorEstadio(String estadio) {
        FdMatchesApiResponse resp = footballDataService.getAllMatches();
        if (resp == null || resp.getMatches() == null || resp.getMatches().isEmpty()) {
            return List.of();
        }

        Set<Long> idsPartido = resp.getMatches().stream()
                .filter(m -> m != null && m.getId() != null)
                .filter(m -> m.getVenue() != null && estadio.equalsIgnoreCase(m.getVenue().trim()))
                .map(FdMatchDto::getId)
                .collect(Collectors.toSet());

        if (idsPartido.isEmpty()) {
            return List.of();
        }

        return prediccionRepository.findByApiPartidoIdIn(idsPartido).stream()
                .map(Prediccion::getUsuario)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }
}
