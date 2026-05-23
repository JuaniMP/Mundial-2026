package co.edu.unbosque.controller.backoffice;

import co.edu.unbosque.dto.ApiResponse;
import co.edu.unbosque.dto.BackofficeDTOs.LogResponse;
import co.edu.unbosque.dto.BackofficeDTOs.LogsFilterRequest;
import co.edu.unbosque.service.backoffice.LogsAuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/logs")
@RequiredArgsConstructor
public class LogsAuditoriaController {

    private final LogsAuditoriaService logsService;

    @PostMapping("/buscar")
    @PreAuthorize("hasAnyRole('COMPLIANCE','ADMIN')")
    public ResponseEntity<ApiResponse<List<LogResponse>>> buscar(
            @RequestBody LogsFilterRequest filtro) {
        return ResponseEntity.ok(ApiResponse.success(logsService.filtrar(filtro), "Logs"));
    }
}
