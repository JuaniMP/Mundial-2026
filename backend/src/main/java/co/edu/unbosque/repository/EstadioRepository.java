package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Estadio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstadioRepository extends JpaRepository<Estadio, Integer> {
    List<Estadio> findBySedeId(Integer sedeId);
    Optional<Estadio> findByNombre(String nombre);
}