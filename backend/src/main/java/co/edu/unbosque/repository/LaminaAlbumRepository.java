package co.edu.unbosque.repository;

import co.edu.unbosque.entity.LaminaAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaminaAlbumRepository extends JpaRepository<LaminaAlbum, LaminaAlbum.LaminaAlbumId> {
    List<LaminaAlbum> findByAlbumId(Integer albumId);
    Optional<LaminaAlbum> findByAlbumIdAndLaminaId(Integer albumId, Integer laminaId);
}