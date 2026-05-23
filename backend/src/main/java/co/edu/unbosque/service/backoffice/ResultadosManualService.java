package co.edu.unbosque.service.backoffice;

import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualRequest;
import co.edu.unbosque.dto.BackofficeDTOs.ResultadoManualResponse;
import co.edu.unbosque.entity.Prediccion;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.repository.PrediccionRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Caso de Uso 11: Carga manual de resultados deportivos.
 * Cuando la API externa falla, el Admin escribe el marcador a mano y se
 * dispara el recalculo automático de los puntajes de las pollas.
 *
 * Reglas de puntaje:
 *  - 5 puntos si el marcador exacto coincide.
 *  - 3 puntos si solo se acierta el ganador (o el empate).
 *  - 0 puntos en caso contrario.
 */
@Service
@RequiredArgsConstructor
public class ResultadosManualService {

    private final PrediccionRepository prediccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditLogger auditLogger;

    @Transactional
    public ResultadoManualResponse cargar(Integer adminId, ResultadoManualRequest req) {
        if (req.getPartidoId() == null || req.getGolesLocal() == null
                || req.getGolesVisitante() == null) {
            throw new IllegalArgumentException("Faltan datos del partido");
        }
        long apiPartidoId = req.getPartidoId().longValue();
        List<Prediccion> preds = prediccionRepository.findByApiPartidoId(apiPartidoId);

        int local = req.getGolesLocal();
        int visit = req.getGolesVisitante();
        int recalculadas = 0;
        Set<Integer> pollasSet = new HashSet<>();
        for (Prediccion p : preds) {
            int puntos = calcularPuntos(p.getGolesLocal(), p.getGolesVisitante(), local, visit);
            p.setPuntosObtenidos(puntos);
            prediccionRepository.save(p);
            recalculadas++;
            if (p.getPolla() != null) pollasSet.add(p.getPolla().getId());
        }

        Usuario admin = usuarioRepository.findById(adminId).orElse(null);
        auditLogger.log("RESULTADO_MANUAL", admin,
                "Resultado manual partido=" + apiPartidoId + " " + local + "-" + visit
                        + " | predicciones recalculadas=" + recalculadas
                        + " | obs=" + (req.getObservacion() == null ? "" : req.getObservacion()),
                "MEDIA");

        return ResultadoManualResponse.builder()
                .partidoId(req.getPartidoId())
                .golesLocal(local)
                .golesVisitante(visit)
                .prediccionesRecalculadas(recalculadas)
                .pollasAfectadas(pollasSet.size())
                .build();
    }

    private int calcularPuntos(int gL, int gV, int rL, int rV) {
        if (gL == rL && gV == rV) return 5;
        boolean ganadorIgual = (Integer.compare(gL, gV) == Integer.compare(rL, rV));
        return ganadorIgual ? 3 : 0;
    }
}
