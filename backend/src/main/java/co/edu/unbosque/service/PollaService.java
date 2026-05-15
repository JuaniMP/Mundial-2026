package co.edu.unbosque.service;

import co.edu.unbosque.dto.PollaRequest;
import co.edu.unbosque.dto.PollaResponse;
import co.edu.unbosque.dto.PrediccionRequest;
import co.edu.unbosque.dto.PrediccionResponse;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PollaService {

    private final PollaRepository pollaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ParticipantePollaRepository participantePollaRepository;
    private final PrediccionRepository prediccionRepository;

    public List<PollaResponse> getAllPollas() {
        return pollaRepository.findAll().stream().map(this::toPollaResponse).collect(Collectors.toList());
    }

    public PollaResponse getPollaById(Integer id) {
        Polla polla = pollaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));
        return toPollaResponse(polla);
    }

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

    @Transactional
    public PrediccionResponse createPrediccion(PrediccionRequest request, Integer usuarioId) {
        Polla polla = pollaRepository.findById(request.getIdPolla())
                .orElseThrow(() -> new ResourceNotFoundException("Polla no encontrada"));

        if (participantePollaRepository.findByUsuarioIdAndPollaId(usuarioId, polla.getId()).isEmpty()) {
            throw new BadRequestException("No eres participante de esta polla");
        }

        if (prediccionRepository.findByUsuarioIdAndPollaIdAndApiPartidoId(
                usuarioId, polla.getId(), request.getApiPartidoId()).isPresent()) {
            throw new BadRequestException("Ya has hecho una predicción para este partido");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Prediccion prediccion = Prediccion.builder()
                .golesLocal(request.getGolesLocal())
                .golesVisitante(request.getGolesVisitante())
                .puntosObtenidos(0)
                .usuario(usuario)
                .polla(polla)
                .apiPartidoId(request.getApiPartidoId())
                .build();

        prediccion = prediccionRepository.save(prediccion);
        return toPrediccionResponse(prediccion);
    }

    public List<PrediccionResponse> getPrediccionesByPolla(Integer pollaId) {
        return prediccionRepository.findByPollaId(pollaId).stream()
                .map(this::toPrediccionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Evalúa predicciones de un partido una vez que el partido ha terminado.
     * El resultado real del partido (marcadores) debe suministrarse desde la API de football-data.org.
     *
     * @param pollaId        ID de la polla
     * @param apiPartidoId   ID del partido en football-data.org
     * @param marcadorLocal  Goles del equipo local (resultado real)
     * @param marcadorVisitante Goles del equipo visitante (resultado real)
     */
    @Transactional
    public void evaluarPredicciones(Integer pollaId, Long apiPartidoId,
                                    Integer marcadorLocal, Integer marcadorVisitante) {
        List<Prediccion> predicciones = prediccionRepository.findByPollaIdAndApiPartidoId(pollaId, apiPartidoId);

        for (Prediccion prediccion : predicciones) {
            int puntos = 0;
            if (marcadorLocal.equals(prediccion.getGolesLocal()) &&
                marcadorVisitante.equals(prediccion.getGolesVisitante())) {
                puntos = 10; // Resultado exacto
            } else if (marcadorLocal > marcadorVisitante && prediccion.getGolesLocal() > prediccion.getGolesVisitante()) {
                puntos = 5; // Ganador correcto (local)
            } else if (marcadorLocal < marcadorVisitante && prediccion.getGolesLocal() < prediccion.getGolesVisitante()) {
                puntos = 5; // Ganador correcto (visitante)
            } else if (marcadorLocal.equals(marcadorVisitante) && prediccion.getGolesLocal().equals(prediccion.getGolesVisitante())) {
                puntos = 5; // Empate correcto
            }

            prediccion.setPuntosObtenidos(puntos);
            prediccionRepository.save(prediccion);

            final int puntosFinales = puntos;
            participantePollaRepository
                    .findByUsuarioIdAndPollaId(prediccion.getUsuario().getId(), pollaId)
                    .ifPresent(p -> {
                        p.setPuntosAcumulados(p.getPuntosAcumulados() + puntosFinales);
                        participantePollaRepository.save(p);
                    });
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
