package co.edu.unbosque.repository;

import co.edu.unbosque.entity.ReporteCompliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteComplianceRepository extends JpaRepository<ReporteCompliance, Integer> {
    List<ReporteCompliance> findByGeneradorId(Integer generadorId);
    List<ReporteCompliance> findByTipoReporte(String tipoReporte);
}