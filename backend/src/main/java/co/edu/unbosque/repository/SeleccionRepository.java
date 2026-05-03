package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Seleccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeleccionRepository extends JpaRepository<Seleccion, Integer> {
    Optional<Seleccion> findByCodigoFifa(String codigoFifa);
    Optional<Seleccion> findByPais(String pais);
    List<Seleccion> findByGrupo(String grupo);
    List<Seleccion> findByConfederacion(String confederacion);
}