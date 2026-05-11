package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Partido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PartidoRepository extends JpaRepository<Partido, Integer> {
    List<Partido> findByEstado(String estado);
    List<Partido> findByRonda(String ronda);
    List<Partido> findByEstadioId(Integer estadioId);

    @Query("SELECT p FROM Partido p WHERE p.fechaHora >= :startDate AND p.fechaHora <= :endDate")
    List<Partido> findByFechaHoraBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT p FROM Partido p WHERE p.seleccionLocal.id = :seleccionId OR p.seleccionVisitante.id = :seleccionId ORDER BY p.fechaHora ASC")
    List<Partido> findBySeleccion(Integer seleccionId);

    @Query("SELECT p FROM Partido p WHERE (p.seleccionLocal.id = :seleccionId OR p.seleccionVisitante.id = :seleccionId) AND p.estado = 'PROGRAMADO' ORDER BY p.fechaHora ASC")
    List<Partido> findProximosPartidosBySeleccion(Integer seleccionId);
}