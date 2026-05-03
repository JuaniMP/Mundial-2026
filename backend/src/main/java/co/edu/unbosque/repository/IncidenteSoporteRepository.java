package co.edu.unbosque.repository;

import co.edu.unbosque.entity.IncidenteSoporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenteSoporteRepository extends JpaRepository<IncidenteSoporte, Integer> {
    List<IncidenteSoporte> findByReportadorId(Integer reportadorId);
    List<IncidenteSoporte> findByAgenteSoporteId(Integer agenteId);
    List<IncidenteSoporte> findByEstado(String estado);
    List<IncidenteSoporte> findByPrioridad(String prioridad);
}