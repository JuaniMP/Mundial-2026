package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.AlertaResponse;
import co.edu.unbosque.service.backoffice.AlertasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/alertas")
@RequiredArgsConstructor
public class AlertasController {

    private final AlertasService alertasService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<List<AlertaResponse>>> listar(
            @RequestParam(name = "soloAbiertas", defaultValue = "true") boolean soloAbiertas) {
        return ResponseEntity.ok(ApiResponse.success(
                alertasService.listar(soloAbiertas), "Alertas"));
    }

    @PostMapping("/{id}/revisar")
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<AlertaResponse>> revisar(
            @PathVariable Integer id,
            @RequestParam(name = "revisada", defaultValue = "true") boolean revisada) {
        return ResponseEntity.ok(ApiResponse.success(
                alertasService.marcarRevisada(id, revisada), "Alerta actualizada"));
    }
}
