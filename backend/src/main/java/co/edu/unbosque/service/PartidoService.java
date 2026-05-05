package co.edu.unbosque.service;

import co.edu.unbosque.dto.PartidoRequest;
import co.edu.unbosque.dto.PartidoResponse;
import co.edu.unbosque.entity.Estadio;
import co.edu.unbosque.entity.Partido;
import co.edu.unbosque.entity.Seleccion;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.EstadioRepository;
import co.edu.unbosque.repository.PartidoRepository;
import co.edu.unbosque.repository.SeleccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PartidoService {

    private final PartidoRepository partidoRepository;
    private final EstadioRepository estadioRepository;
    private final SeleccionRepository seleccionRepository;

    @Transactional(readOnly = true)
    public List<PartidoResponse> getAllPartidos() {
        return partidoRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PartidoResponse getPartidoById(Integer id) {
        Partido partido = partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado con ID: " + id));
        return toResponse(partido);
    }

    @Transactional(readOnly = true)
    public List<PartidoResponse> getPartidosByEstado(String estado) {
        return partidoRepository.findByEstado(estado).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PartidoResponse> getPartidosByRonda(String ronda) {
        return partidoRepository.findByRonda(ronda).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PartidoResponse createPartido(PartidoRequest request) {
        Estadio estadio = estadioRepository.findById(request.getIdEstadio())
                .orElseThrow(() -> new ResourceNotFoundException("Estadio no encontrado"));

        Seleccion seleccionLocal = seleccionRepository.findById(request.getIdSeleccionLocal())
                .orElseThrow(() -> new ResourceNotFoundException("Selección local no encontrada"));

        Seleccion seleccionVisitante = seleccionRepository.findById(request.getIdSeleccionVisitante())
                .orElseThrow(() -> new ResourceNotFoundException("Selección visitante no encontrada"));

        Partido partido = Partido.builder()
                .fechaHora(request.getFechaHora())
                .ronda(request.getRonda())
                .estado("PROGRAMADO")
                .marcadorLocal(0)
                .marcadorVisitante(0)
                .estadio(estadio)
                .seleccionLocal(seleccionLocal)
                .seleccionVisitante(seleccionVisitante)
                .build();

        partido = partidoRepository.save(partido);
        return toResponse(partido);
    }

    @Transactional
    public PartidoResponse updateResultado(Integer id, Integer marcadorLocal, Integer marcadorVisitante) {
        Partido partido = partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado"));

        partido.setMarcadorLocal(marcadorLocal);
        partido.setMarcadorVisitante(marcadorVisitante);
        partido.setEstado("TERMINADO");

        partido = partidoRepository.save(partido);
        return toResponse(partido);
    }

    @Transactional
    public PartidoResponse updateEstado(Integer id, String estado) {
        Partido partido = partidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partido no encontrado"));

        partido.setEstado(estado);
        partido = partidoRepository.save(partido);
        return toResponse(partido);
    }

    private PartidoResponse toResponse(Partido partido) {
        return PartidoResponse.builder()
                .id(partido.getId())
                .fechaHora(partido.getFechaHora())
                .ronda(partido.getRonda())
                .estado(partido.getEstado())
                .marcadorLocal(partido.getMarcadorLocal())
                .marcadorVisitante(partido.getMarcadorVisitante())
                .idEstadio(partido.getEstadio().getId())
                .estadioNombre(partido.getEstadio().getNombre())
                .idSeleccionLocal(partido.getSeleccionLocal().getId())
                .seleccionLocal(partido.getSeleccionLocal().getPais())
                .idSeleccionVisitante(partido.getSeleccionVisitante().getId())
                .seleccionVisitante(partido.getSeleccionVisitante().getPais())
                .build();
    }
}