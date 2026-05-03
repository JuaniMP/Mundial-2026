package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    List<Notificacion> findByDestinatarioId(Integer destinatarioId);
    List<Notificacion> findByEmisorId(Integer emisorId);
    List<Notificacion> findByCanal(String canal);
}