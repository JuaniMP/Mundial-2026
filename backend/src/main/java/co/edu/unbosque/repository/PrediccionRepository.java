package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Prediccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrediccionRepository extends JpaRepository<Prediccion, Integer> {
    List<Prediccion> findByUsuarioId(Integer usuarioId);
    List<Prediccion> findByPollaId(Integer pollaId);
    List<Prediccion> findByPartidoId(Integer partidoId);
    Optional<Prediccion> findByUsuarioIdAndPollaIdAndPartidoId(Integer usuarioId, Integer pollaId, Integer partidoId);

    @Query("SELECT p FROM Prediccion p WHERE p.polla.id = :pollaId ORDER BY p.puntosObtenidos DESC")
    List<Prediccion> findTopByPollaIdOrderByPuntosDesc(Integer pollaId);
}