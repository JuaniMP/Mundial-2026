package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Integer> {
    Optional<Album> findByUsuarioId(Integer usuarioId);
    boolean existsByUsuarioId(Integer usuarioId);
}