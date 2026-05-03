package co.edu.unbosque.repository;

import co.edu.unbosque.entity.ReporteInteraccionAPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReporteInteraccionAPIRepository extends JpaRepository<ReporteInteraccionAPI, Integer> {
    List<ReporteInteraccionAPI> findByAliadoId(Integer aliadoId);
    List<ReporteInteraccionAPI> findByFechaCorte(LocalDate fechaCorte);
}