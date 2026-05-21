package co.edu.unbosque.repository;

import co.edu.unbosque.entity.PerfilPreferencias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilPreferenciasRepository extends JpaRepository<PerfilPreferencias, Integer> {
    Optional<PerfilPreferencias> findByIdUsuario(Integer idUsuario);
}
