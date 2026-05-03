package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Polla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollaRepository extends JpaRepository<Polla, Integer> {
    Optional<Polla> findByCodigoAcceso(String codigoAcceso);
    List<Polla> findByCreadorId(Integer creadorId);
}