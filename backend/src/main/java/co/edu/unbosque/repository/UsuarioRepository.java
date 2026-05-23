package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    @Query("SELECT DISTINCT u FROM Usuario u JOIN FETCH u.rol WHERE u.email = :email")
    Optional<Usuario> findByEmail(String email);

    @Query("SELECT u.rol.nombre FROM Usuario u WHERE u.email = :email")
    Optional<String> findRoleNameByEmail(String email);

    boolean existsByEmail(String email);
    List<Usuario> findByRolId(Integer rolId);

    @Query("SELECT u FROM Usuario u WHERE LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Usuario> searchByNombreOrEmail(String q);

    List<Usuario> findByCiudadIgnoreCase(String ciudad);
}