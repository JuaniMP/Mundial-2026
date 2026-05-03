package co.edu.unbosque.repository;

import co.edu.unbosque.entity.IntercambioLamina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntercambioLaminaRepository extends JpaRepository<IntercambioLamina, Integer> {
    List<IntercambioLamina> findBySolicitanteId(Integer solicitanteId);
    List<IntercambioLamina> findByReceptorId(Integer receptorId);
    List<IntercambioLamina> findByEstado(String estado);
}