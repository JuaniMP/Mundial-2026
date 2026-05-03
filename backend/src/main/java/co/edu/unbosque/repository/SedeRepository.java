package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Integer> {
    Optional<Sede> findByCiudadAndPais(String ciudad, String pais);
}