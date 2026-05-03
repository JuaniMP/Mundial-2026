package co.edu.unbosque.repository;

import co.edu.unbosque.entity.ParticipantePolla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantePollaRepository extends JpaRepository<ParticipantePolla, ParticipantePolla.ParticipantePollaId> {
    List<ParticipantePolla> findByPollaId(Integer pollaId);
    List<ParticipantePolla> findByUsuarioId(Integer usuarioId);
    Optional<ParticipantePolla> findByUsuarioIdAndPollaId(Integer usuarioId, Integer pollaId);
}