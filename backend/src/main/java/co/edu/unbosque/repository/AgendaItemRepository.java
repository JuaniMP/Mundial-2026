package co.edu.unbosque.repository;

import co.edu.unbosque.entity.AgendaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgendaItemRepository extends JpaRepository<AgendaItem, Integer> {
    List<AgendaItem> findByUsuarioIdOrderByFechaInicioAsc(Integer usuarioId);

    @Query("SELECT a FROM AgendaItem a WHERE a.usuario.id = :usuarioId AND a.fechaInicio >= :desde ORDER BY a.fechaInicio ASC")
    List<AgendaItem> findUpcoming(@Param("usuarioId") Integer usuarioId, @Param("desde") LocalDateTime desde);
}
