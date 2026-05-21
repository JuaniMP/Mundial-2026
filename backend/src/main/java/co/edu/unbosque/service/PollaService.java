package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollaService {

    /** Minutos antes del kickoff en los que se bloquean nuevas/cambios de predicción. */
    public static final int LOCK_MINUTES_BEFORE_KICKOFF = 10;

    private final PollaRepository pollaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ParticipantePollaRepository participantePollaRepository;
    private final PrediccionRepository prediccionRepository;

    // ── Pollas ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PollaResponse> getAllPollas() {
        return pollaRepository.findAll().stream().map(this::toPollaResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PollaResponse getPollaById(Integer id) {
        Polla polla = pollaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));
        return toPollaResponse(polla);
    }

    @Transactional(readOnly = true)
    public PollaResponse getPollaByCodigo(String codigoAcceso) {
        Polla polla = pollaRepository.findByCodigoAcceso(codigoAcceso)
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));
        return toPollaResponse(polla);
    }

    @Transactional
    public PollaResponse createPolla(PollaRequest request, Integer usuarioId) {
        Usuario creador = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String codigoAcceso = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Polla polla = Polla.builder()
                .nombre(request.getNombre())
                .codigoAcceso(codigoAcceso)
                .pozoPuntos(0)
                .creador(creador)
                .build();

        polla = pollaRepository.save(polla);

        ParticipantePolla participante = ParticipantePolla.builder()
                .usuario(creador)
                .polla(polla)
                .puntosAcumulados(0)
                .build();
        participantePollaRepository.save(participante);

        return toPollaResponse(polla);
    }

    @Transactional
    public PollaResponse joinPolla(String codigoAcceso, Integer usuarioId) {
        Polla polla = pollaRepository.findByCodigoAcceso(codigoAcceso)
                .orElseThrow(() -> new ResourceNotFoundException("Código de acceso inválido"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (participantePollaRepository.findByUsuarioIdAndPollaId(usuarioId, polla.getId()).isPresent()) {
            throw new BadRequestException("Ya estás unido a esta polla");
        }

        ParticipantePolla participante = ParticipantePolla.builder()
                .usuario(usuario)
                .polla(polla)
                .puntosAcumulados(0)
                .build();
        participantePollaRepository.save(participante);

        return toPollaResponse(polla);
    }

    /** Devuelve las pollas en las que el usuario es participante, con su posición y puntos. */
    @Transactional(readOnly = true)
    public List<PollaResumenResponse> getMisPollas(Integer usuarioId) {
        List<ParticipantePolla> mis = participantePollaRepository.findByUsuarioId(usuarioId);
        List<PollaResumenResponse> out = new ArrayList<>();

        for (ParticipantePolla pp : mis) {
            Polla polla = pp.getPolla();
            List<ParticipantePolla> todos = participantePollaRepository.findByPollaId(polla.getId());

            List<ParticipantePolla> ordenados = todos.stream()
                    .sorted(Comparator.comparingInt(
                            (ParticipantePolla x) -> x.getPuntosAcumulados() == null ? 0 : x.getPuntosAcumulados()
                    ).reversed())
                    .toList();

            int posicion = 1;
            for (int i = 0; i < ordenados.size(); i++) {
                if (ordenados.get(i).getUsuario().getId().equals(usuarioId)) {
                    posicion = i + 1;
                    break;
                }
            }

            out.add(PollaResumenResponse.builder()
                    .id(polla.getId())
                    .nombre(polla.getNombre())
                    .codigoAcceso(polla.getCodigoAcceso())
                    .pozoPuntos(polla.getPozoPuntos())
                    .nombreCreador(polla.getCreador().getNombre())
                    .totalParticipantes(todos.size())
                    .misPuntos(pp.getPuntosAcumulados() == null ? 0 : pp.getPuntosAcumulados())
                    .miPosicion(posicion)
                    .soyCreador(polla.getCreador().getId().equals(usuarioId))
                    .build());
        }
        return out;
    }

    // ── Predicciones ─────────────────────────────────────────────────────────

    @Transactional
    public PrediccionResponse createPrediccion(PrediccionRequest request, Integer usuarioId) {
        Polla polla = pollaRepository.findById(request.getIdPolla())
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));

        if (participantePollaRepository.findByUsuarioIdAndPollaId(usuarioId, polla.getId()).isEmpty()) {
            throw new BadRequestException("No eres participante de esta polla");
        }

        verificarCandado(request.getFechaPartido());

        Optional<Prediccion> existente = prediccionRepository
                .findByUsuarioIdAndPollaIdAndApiPartidoId(usuarioId, polla.getId(), request.getApiPartidoId());

        Prediccion prediccion;
        if (existente.isPresent()) {
            prediccion = existente.get();
            prediccion.setGolesLocal(request.getGolesLocal());
            prediccion.setGolesVisitante(request.getGolesVisitante());
        } else {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
            prediccion = Prediccion.builder()
                    .golesLocal(request.getGolesLocal())
                    .golesVisitante(request.getGolesVisitante())
                    .puntosObtenidos(0)
                    .usuario(usuario)
                    .polla(polla)
                    .apiPartidoId(request.getApiPartidoId())
                    .build();
        }
        prediccion = prediccionRepository.save(prediccion);
        return toPrediccionResponse(prediccion);
    }

    @Transactional(readOnly = true)
    public List<PrediccionResponse> getPrediccionesByPolla(Integer pollaId) {
        return prediccionRepository.findByPollaId(pollaId).stream()
                .map(this::toPrediccionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PrediccionResponse> getMisPredicciones(Integer pollaId, Integer usuarioId) {
        return prediccionRepository.findByPollaId(pollaId).stream()
                .filter(p -> p.getUsuario().getId().equals(usuarioId))
                .map(this::toPrediccionResponse)
                .collect(Collectors.toList());
    }

    /** Devuelve el ranking ordenado de la polla, incluyendo medallas para top 3. */
    @Transactional(readOnly = true)
    public List<RankingEntryResponse> getRanking(Integer pollaId) {
        Polla polla = pollaRepository.findById(pollaId)
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));

        List<ParticipantePolla> participantes = participantePollaRepository.findByPollaId(polla.getId());
        List<Prediccion> todasPredicciones = prediccionRepository.findByPollaId(polla.getId());

        Map<Integer, Long> totalPorUsuario = todasPredicciones.stream()
                .collect(Collectors.groupingBy(p -> p.getUsuario().getId(), Collectors.counting()));

        Map<Integer, Long> exactasPorUsuario = todasPredicciones.stream()
                .filter(p -> p.getPuntosObtenidos() != null && p.getPuntosObtenidos() >= 10)
                .collect(Collectors.groupingBy(p -> p.getUsuario().getId(), Collectors.counting()));

        List<ParticipantePolla> ordenados = participantes.stream()
                .sorted(Comparator.comparingInt(
                        (ParticipantePolla x) -> x.getPuntosAcumulados() == null ? 0 : x.getPuntosAcumulados()
                ).reversed())
                .toList();

        List<RankingEntryResponse> out = new ArrayList<>();
        for (int i = 0; i < ordenados.size(); i++) {
            ParticipantePolla pp = ordenados.get(i);
            Usuario u = pp.getUsuario();
            int posicion = i + 1;
            String premio = switch (posicion) {
                case 1 -> "ORO";
                case 2 -> "PLATA";
                case 3 -> "BRONCE";
                default -> null;
            };
            out.add(RankingEntryResponse.builder()
                    .posicion(posicion)
                    .idUsuario(u.getId())
                    .nombreUsuario(u.getNombre())
                    .email(u.getEmail())
                    .seleccionFavorita(u.getSeleccionFavorita())
                    .puntos(pp.getPuntosAcumulados() == null ? 0 : pp.getPuntosAcumulados())
                    .totalPredicciones(totalPorUsuario.getOrDefault(u.getId(), 0L).intValue())
                    .aciertosExactos(exactasPorUsuario.getOrDefault(u.getId(), 0L).intValue())
                    .premio(premio)
                    .build());
        }
        return out;
    }

    /**
     * Evalúa predicciones de un partido una vez que el partido ha terminado.
     */
    @Transactional
    public void evaluarPredicciones(Integer pollaId, Long apiPartidoId,
                                    Integer marcadorLocal, Integer marcadorVisitante) {
        List<Prediccion> predicciones = prediccionRepository.findByPollaIdAndApiPartidoId(pollaId, apiPartidoId);

        for (Prediccion prediccion : predicciones) {
            int puntos = 0;
            if (marcadorLocal.equals(prediccion.getGolesLocal()) &&
                marcadorVisitante.equals(prediccion.getGolesVisitante())) {
                puntos = 10;
            } else if (marcadorLocal > marcadorVisitante && prediccion.getGolesLocal() > prediccion.getGolesVisitante()) {
                puntos = 5;
            } else if (marcadorLocal < marcadorVisitante && prediccion.getGolesLocal() < prediccion.getGolesVisitante()) {
                puntos = 5;
            } else if (marcadorLocal.equals(marcadorVisitante) && prediccion.getGolesLocal().equals(prediccion.getGolesVisitante())) {
                puntos = 5;
            }

            prediccion.setPuntosObtenidos(puntos);
            prediccionRepository.save(prediccion);

            final int puntosFinales = puntos;
            participantePollaRepository
                    .findByUsuarioIdAndPollaId(prediccion.getUsuario().getId(), pollaId)
                    .ifPresent(p -> {
                        p.setPuntosAcumulados((p.getPuntosAcumulados() == null ? 0 : p.getPuntosAcumulados()) + puntosFinales);
                        participantePollaRepository.save(p);
                    });
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void verificarCandado(String fechaPartidoIso) {
        if (fechaPartidoIso == null || fechaPartidoIso.isBlank()) return;
        try {
            OffsetDateTime kickoff = OffsetDateTime.parse(fechaPartidoIso);
            OffsetDateTime ahora = OffsetDateTime.now(ZoneOffset.UTC);
            Duration restante = Duration.between(ahora, kickoff);
            if (restante.toMinutes() < LOCK_MINUTES_BEFORE_KICKOFF) {
                throw new BadRequestException(
                        "Las predicciones se bloquean " + LOCK_MINUTES_BEFORE_KICKOFF + " min antes del partido");
            }
        } catch (java.time.format.DateTimeParseException ignore) {
            // Si el front manda fecha mal, no bloqueamos
        }
    }

    private PollaResponse toPollaResponse(Polla polla) {
        return PollaResponse.builder()
                .id(polla.getId())
                .nombre(polla.getNombre())
                .codigoAcceso(polla.getCodigoAcceso())
                .pozoPuntos(polla.getPozoPuntos())
                .idCreador(polla.getCreador().getId())
                .nombreCreador(polla.getCreador().getNombre())
                .build();
    }

    private PrediccionResponse toPrediccionResponse(Prediccion prediccion) {
        return PrediccionResponse.builder()
                .id(prediccion.getId())
                .golesLocal(prediccion.getGolesLocal())
                .golesVisitante(prediccion.getGolesVisitante())
                .puntosObtenidos(prediccion.getPuntosObtenidos())
                .idUsuario(prediccion.getUsuario().getId())
                .nombreUsuario(prediccion.getUsuario().getNombre())
                .apiPartidoId(prediccion.getApiPartidoId())
                .build();
    }
}
