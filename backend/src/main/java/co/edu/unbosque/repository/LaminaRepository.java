package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Lamina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaminaRepository extends JpaRepository<Lamina, Integer> {
    List<Lamina> findByRareza(String rareza);
    List<Lamina> findByJugadorId(Integer jugadorId);

    @Query("SELECT l FROM Lamina l ORDER BY RAND()")
    List<Lamina> findRandom();
}