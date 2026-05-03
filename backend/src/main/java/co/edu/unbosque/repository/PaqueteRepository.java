package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaqueteRepository extends JpaRepository<Paquete, Integer> {
    List<Paquete> findByUsuarioId(Integer usuarioId);
    List<Paquete> findByEstado(String estado);
}