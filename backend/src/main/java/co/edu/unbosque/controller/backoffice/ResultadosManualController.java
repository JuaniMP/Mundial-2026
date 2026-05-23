package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualResponse;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResultadoManualResponse>> cargar(
            @RequestBody ResultadoManualRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer adminId = currentUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(
                resultadosService.cargar(adminId, req),
                "Resultado cargado y predicciones recalculadas"));
    }

    private Integer currentUserId(UserDetails userDetails) {
        if (userDetails == null) throw new ResourceNotFoundException("No autenticado");
        Usuario u = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return u.getId();
    }
}
