package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Jugador;
import co.edu.unbosque.entity.Seleccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JugadorRepository extends JpaRepository<Jugador, Integer> {
    List<Jugador> findBySeleccionId(Integer seleccionId);
    List<Jugador> findBySeleccion(Seleccion seleccion);
    List<Jugador> findByPosicion(String posicion);
}