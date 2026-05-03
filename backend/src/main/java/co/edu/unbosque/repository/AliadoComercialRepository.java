package co.edu.unbosque.repository;

import co.edu.unbosque.entity.AliadoComercial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AliadoComercialRepository extends JpaRepository<AliadoComercial, Integer> {
    Optional<AliadoComercial> findByTokenAcceso(String token);
    Optional<AliadoComercial> findByNombre(String nombre);
    List<AliadoComercial> findByEstado(String estado);
    List<AliadoComercial> findByTipoServicio(String tipoServicio);
}