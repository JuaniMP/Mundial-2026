package co.edu.unbosque.service;

import co.edu.unbosque.dto.SeleccionRequest;
import co.edu.unbosque.dto.SeleccionResponse;
import co.edu.unbosque.entity.Seleccion;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.SeleccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeleccionService {

    private final SeleccionRepository seleccionRepository;

    public List<SeleccionResponse> getAllSelecciones() {
        return seleccionRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SeleccionResponse getSeleccionById(Integer id) {
        Seleccion seleccion = seleccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada con ID: " + id));
        return toResponse(seleccion);
    }

    public SeleccionResponse getSeleccionByCodigoFifa(String codigoFifa) {
        Seleccion seleccion = seleccionRepository.findByCodigoFifa(codigoFifa)
                .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada con código FIFA: " + codigoFifa));
        return toResponse(seleccion);
    }

    public List<SeleccionResponse> getSeleccionesByGrupo(String grupo) {
        return seleccionRepository.findByGrupo(grupo).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SeleccionResponse> getSeleccionesByConfederacion(String confederacion) {
        return seleccionRepository.findByConfederacion(confederacion).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SeleccionResponse createSeleccion(SeleccionRequest request) {
        if (seleccionRepository.findByCodigoFifa(request.getCodigoFifa()).isPresent()) {
            throw new BadRequestException("Ya existe una selección con código FIFA: " + request.getCodigoFifa());
        }
        if (seleccionRepository.findByPais(request.getPais()).isPresent()) {
            throw new BadRequestException("Ya existe una selección con país: " + request.getPais());
        }

        Seleccion seleccion = Seleccion.builder()
                .pais(request.getPais())
                .codigoFifa(request.getCodigoFifa())
                .confederacion(request.getConfederacion())
                .grupo(request.getGrupo())
                .historial(request.getHistorial())
                .banderaUrl(request.getBanderaUrl())
                .build();

        seleccion = seleccionRepository.save(seleccion);
        return toResponse(seleccion);
    }

    @Transactional
    public SeleccionResponse updateSeleccion(Integer id, SeleccionRequest request) {
        Seleccion seleccion = seleccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Selección no encontrada con ID: " + id));

        if (request.getPais() != null) seleccion.setPais(request.getPais());
        if (request.getConfederacion() != null) seleccion.setConfederacion(request.getConfederacion());
        if (request.getGrupo() != null) seleccion.setGrupo(request.getGrupo());
        if (request.getHistorial() != null) seleccion.setHistorial(request.getHistorial());
        if (request.getBanderaUrl() != null) seleccion.setBanderaUrl(request.getBanderaUrl());

        seleccion = seleccionRepository.save(seleccion);
        return toResponse(seleccion);
    }

    @Transactional
    public void deleteSeleccion(Integer id) {
        if (!seleccionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Selección no encontrada con ID: " + id);
        }
        seleccionRepository.deleteById(id);
    }

    private SeleccionResponse toResponse(Seleccion seleccion) {
        return SeleccionResponse.builder()
                .id(seleccion.getId())
                .pais(seleccion.getPais())
                .codigoFifa(seleccion.getCodigoFifa())
                .confederacion(seleccion.getConfederacion())
                .grupo(seleccion.getGrupo())
                .historial(seleccion.getHistorial())
                .banderaUrl(seleccion.getBanderaUrl())
                .build();
    }
}