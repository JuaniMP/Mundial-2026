package co.edu.unbosque.service;

import co.edu.unbosque.dto.JugadorRequest;
import co.edu.unbosque.dto.JugadorResponse;
import co.edu.unbosque.entity.Jugador;
import co.edu.unbosque.entity.Seleccion;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.JugadorRepository;
import co.edu.unbosque.repository.SeleccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JugadorService {

    private final JugadorRepository jugadorRepository;
    private final SeleccionRepository seleccionRepository;

    public List<JugadorResponse> getAllJugadores() {
        return jugadorRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public JugadorResponse getJugadorById(Integer id) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con ID: " + id));
        return toResponse(jugador);
    }

    public List<JugadorResponse> getJugadoresBySeleccion(Integer seleccionId) {
        return jugadorRepository.findBySeleccionId(seleccionId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<JugadorResponse> getJugadoresByPosicion(String posicion) {
        return jugadorRepository.findByPosicion(posicion).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JugadorResponse createJugador(JugadorRequest request) {
        Seleccion seleccion = seleccionRepository.findById(request.getIdSeleccion())
                .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada con ID: " + request.getIdSeleccion()));

        Jugador jugador = Jugador.builder()
                .nombreCompleto(request.getNombreCompleto())
                .posicion(request.getPosicion())
                .dorsal(request.getDorsal())
                .fechaNacimiento(request.getFechaNacimiento())
                .nacionalidad(request.getNacionalidad())
                .minutosJugados(0)
                .goles(0)
                .fotoUrl(request.getFotoUrl())
                .seleccion(seleccion)
                .build();

        jugador = jugadorRepository.save(jugador);
        return toResponse(jugador);
    }

    @Transactional
    public JugadorResponse updateJugador(Integer id, JugadorRequest request) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con ID: " + id));

        if (request.getNombreCompleto() != null) jugador.setNombreCompleto(request.getNombreCompleto());
        if (request.getPosicion() != null) jugador.setPosicion(request.getPosicion());
        if (request.getDorsal() != null) jugador.setDorsal(request.getDorsal());
        if (request.getFechaNacimiento() != null) jugador.setFechaNacimiento(request.getFechaNacimiento());
        if (request.getNacionalidad() != null) jugador.setNacionalidad(request.getNacionalidad());
        if (request.getFotoUrl() != null) jugador.setFotoUrl(request.getFotoUrl());

        if (request.getIdSeleccion() != null) {
            Seleccion seleccion = seleccionRepository.findById(request.getIdSeleccion())
                    .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada"));
            jugador.setSeleccion(seleccion);
        }

        jugador = jugadorRepository.save(jugador);
        return toResponse(jugador);
    }

    @Transactional
    public void deleteJugador(Integer id) {
        if (!jugadorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Jugador no encontrado con ID: " + id);
        }
        jugadorRepository.deleteById(id);
    }

    @Transactional
    public JugadorResponse updateEstadisticas(Integer id, Integer minutosJugados, Integer goles) {
        Jugador jugador = jugadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Jugador no encontrado con ID: " + id));

        if (minutosJugados != null) {
            jugador.setMinutosJugados(jugador.getMinutosJugados() + minutosJugados);
        }
        if (goles != null) {
            jugador.setGoles(jugador.getGoles() + goles);
        }

        jugador = jugadorRepository.save(jugador);
        return toResponse(jugador);
    }

    private JugadorResponse toResponse(Jugador jugador) {
        return JugadorResponse.builder()
                .id(jugador.getId())
                .nombreCompleto(jugador.getNombreCompleto())
                .posicion(jugador.getPosicion())
                .dorsal(jugador.getDorsal())
                .fechaNacimiento(jugador.getFechaNacimiento())
                .nacionalidad(jugador.getNacionalidad())
                .minutosJugados(jugador.getMinutosJugados())
                .goles(jugador.getGoles())
                .fotoUrl(jugador.getFotoUrl())
                .idSeleccion(jugador.getSeleccion().getId())
                .pais(jugador.getSeleccion().getPais())
                .build();
    }
}