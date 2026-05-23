package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.UsuarioRiesgoResponse;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.EntradaRepository;
import co.edu.unbosque.repository.IntercambioLaminaRepository;
import co.edu.unbosque.repository.LogsTransaccionalRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Gestión del estado de cuentas: búsqueda de usuarios, cómputo del perfil de riesgo,
 * y bloqueo/desbloqueo (congela entradas y participación en pollas).
 */
@Service
@RequiredArgsConstructor
public class GestionCuentasService {

    private final UsuarioRepository usuarioRepository;
    private final IntercambioLaminaRepository intercambioRepository;
    private final EntradaRepository entradaRepository;
    private final LogsTransaccionalRepository logsRepository;
    private final AuditLogger auditLogger;

    @Transactional(readOnly = true)
    public List<UsuarioRiesgoResponse> buscar(String query) {
        List<Usuario> usuarios = (query == null || query.isBlank())
                ? usuarioRepository.findAll().stream().limit(50).collect(Collectors.toList())
                : usuarioRepository.searchByNombreOrEmail(query);
        return usuarios.stream().map(this::toRiesgo).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioRiesgoResponse perfil(Integer usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return toRiesgo(u);
    }

    @Transactional
    public UsuarioRiesgoResponse bloquear(Integer usuarioId, String razon) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        u.setBloqueado(true);
        u.setRazonBloqueo(razon == null ? "Sin razón especificada" : razon);
        u.setFechaBloqueo(LocalDateTime.now());
        usuarioRepository.save(u);
        auditLogger.log("BLOQUEO_CUENTA", u,
                "Cuenta bloqueada por compliance. Razón: " + razon, "ALTA");
        return toRiesgo(u);
    }

    @Transactional
    public UsuarioRiesgoResponse desbloquear(Integer usuarioId) {
        Usuario u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        u.setBloqueado(false);
        u.setRazonBloqueo(null);
        u.setFechaBloqueo(null);
        usuarioRepository.save(u);
        auditLogger.log("DESBLOQUEO_CUENTA", u, "Cuenta desbloqueada por compliance.", "MEDIA");
        return toRiesgo(u);
    }

    private UsuarioRiesgoResponse toRiesgo(Usuario u) {
        long intercambios = 0;
        long entradasTransfer = 0;
        long alertas = 0;
        try {
            intercambios = intercambioRepository.findAll().stream()
                    .filter(i -> i.getSolicitante() != null && i.getSolicitante().getId().equals(u.getId()))
                    .count();
        } catch (Exception ignore) { /* schema may differ */ }
        try {
            entradasTransfer = entradaRepository.findAll().stream()
                    .filter(e -> e.getUsuarioComprador() != null
                            && e.getUsuarioComprador().getId().equals(u.getId()))
                    .count();
        } catch (Exception ignore) { /* ignore */ }
        try {
            alertas = logsRepository.findAll().stream()
                    .filter(l -> l.getUsuario() != null && l.getUsuario().getId().equals(u.getId()))
                    .filter(l -> "ALTA".equalsIgnoreCase(l.getNivelRiesgo())
                            && !Boolean.TRUE.equals(l.getVerificadoCompliance()))
                    .count();
        } catch (Exception ignore) { /* ignore */ }

        String nivelRiesgo = "BAJO";
        if (alertas >= 3 || intercambios > 50) nivelRiesgo = "ALTO";
        else if (alertas >= 1 || intercambios > 20) nivelRiesgo = "MEDIO";

        return UsuarioRiesgoResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .rol(u.getRol() == null ? null : u.getRol().getNombre())
                .fechaRegistro(u.getFechaRegistro() == null ? null : u.getFechaRegistro().toString())
                .bloqueado(Boolean.TRUE.equals(u.getBloqueado()))
                .razonBloqueo(u.getRazonBloqueo())
                .fechaBloqueo(u.getFechaBloqueo() == null ? null : u.getFechaBloqueo().toString())
                .totalIntercambios((int) intercambios)
                .totalEntradasTransferidas((int) entradasTransfer)
                .alertasAbiertas((int) alertas)
                .nivelRiesgo(nivelRiesgo)
                .build();
    }
}
