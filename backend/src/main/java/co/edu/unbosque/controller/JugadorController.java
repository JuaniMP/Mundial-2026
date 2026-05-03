package co.edu.unbosque.controller;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.service.JugadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jugadores")
@RequiredArgsConstructor
public class JugadorController {

    private final JugadorService jugadorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JugadorResponse>>> getAllJugadores() {
        List<JugadorResponse> jugadores = jugadorService.getAllJugadores();
        return ResponseEntity.ok(ApiResponse.success(jugadores, "Jugadores encontrados"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JugadorResponse>> getJugadorById(@PathVariable Integer id) {
        JugadorResponse jugador = jugadorService.getJugadorById(id);
        return ResponseEntity.ok(ApiResponse.success(jugador, "Jugador encontrado"));
    }

    @GetMapping("/seleccion/{seleccionId}")
    public ResponseEntity<ApiResponse<List<JugadorResponse>>> getJugadoresBySeleccion(@PathVariable Integer seleccionId) {
        List<JugadorResponse> jugadores = jugadorService.getJugadoresBySeleccion(seleccionId);
        return ResponseEntity.ok(ApiResponse.success(jugadores, "Jugadores de la selección"));
    }

    @GetMapping("/posicion/{posicion}")
    public ResponseEntity<ApiResponse<List<JugadorResponse>>> getJugadoresByPosicion(@PathVariable String posicion) {
        List<JugadorResponse> jugadores = jugadorService.getJugadoresByPosicion(posicion);
        return ResponseEntity.ok(ApiResponse.success(jugadores, "Jugadores por posición"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<JugadorResponse>> createJugador(@RequestBody JugadorRequest request) {
        JugadorResponse jugador = jugadorService.createJugador(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(jugador, "Jugador creado"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<ApiResponse<JugadorResponse>> updateJugador(
            @PathVariable Integer id,
            @RequestBody JugadorRequest request) {
        JugadorResponse jugador = jugadorService.updateJugador(id, request);
        return ResponseEntity.ok(ApiResponse.success(jugador, "Jugador actualizado"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJugador(@PathVariable Integer id) {
        jugadorService.deleteJugador(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Jugador eliminado"));
    }
}