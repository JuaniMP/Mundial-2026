package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Aficionado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AficionadoRepository extends JpaRepository<Aficionado, Integer> {
}
