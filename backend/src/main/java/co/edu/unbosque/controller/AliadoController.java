package co.edu.unbosque.controller;

import co.edu.unbosque.entity.AliadoComercial;
import co.edu.unbosque.repository.AliadoComercialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/aliados")
@RequiredArgsConstructor
public class AliadoController {

    private final AliadoComercialRepository aliadoComercialRepository;

    /** Lista pública de aliados activos con nombre y sitio web para el footer. */
    @GetMapping("/publico")
    public ResponseEntity<?> listadoPublico() {
        List<Map<String, String>> data = aliadoComercialRepository.findByEstado("ACTIVO")
                .stream()
                .filter(a -> a.getSitioWeb() != null && !a.getSitioWeb().isBlank())
                .map(a -> Map.of(
                        "nombre",     a.getNombre(),
                        "tipo",       a.getTipoServicio(),
                        "sitioWeb",   a.getSitioWeb()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
