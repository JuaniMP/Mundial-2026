package co.edu.unbosque.repository;

import co.edu.unbosque.entity.LogsTransaccional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogsTransaccionalRepository extends JpaRepository<LogsTransaccional, Integer> {
    List<LogsTransaccional> findByUsuarioId(Integer usuarioId);
    Page<LogsTransaccional> findByUsuarioId(Integer usuarioId, Pageable pageable);
    List<LogsTransaccional> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<LogsTransaccional> findByNivelRiesgo(String nivelRiesgo);
    List<LogsTransaccional> findByVerificadoComplianceFalse();
}