package co.edu.unbosque.repository;

import co.edu.unbosque.entity.RecordatorioViaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordatorioViajeRepository extends JpaRepository<RecordatorioViaje, Integer> {
    List<RecordatorioViaje> findByUsuarioIdOrderByFechaInicioAsc(Integer usuarioId);
}
