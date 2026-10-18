package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.security.UsuarioActual;
import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualResponse;
import co.edu.unbosque.service.backoffice.ResultadosManualService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/backoffice/resultados-manual")
@RequiredArgsConstructor
public class ResultadosManualController {

    private final ResultadosManualService resultadosService;
    private final UsuarioActual usuarioActual;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResultadoManualResponse>> cargar(
            @RequestBody ResultadoManualRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer adminId = usuarioActual.id(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                resultadosService.cargar(adminId, req),
                "Resultado cargado y predicciones recalculadas"));
    }
}
