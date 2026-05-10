package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaqueteRepository extends JpaRepository<Paquete, Integer> {
    List<Paquete> findByUsuarioId(Integer usuarioId);
    List<Paquete> findByEstado(String estado);

    @Query("SELECT COUNT(p) FROM Paquete p WHERE p.usuario.id = :usuarioId AND p.fechaObtencion >= :desde")
    Long countPaquetesDesde(@Param("usuarioId") Integer usuarioId,
                            @Param("desde") LocalDateTime desde);
}