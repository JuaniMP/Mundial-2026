package co.edu.unbosque.repository;

import co.edu.unbosque.entity.Entrada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EntradaRepository extends JpaRepository<Entrada, Integer> {
    Optional<Entrada> findByCodigoQr(String codigoQr);
    List<Entrada> findByPartidoId(Integer partidoId);
    List<Entrada> findByUsuarioCompradorId(Integer usuarioId);
    List<Entrada> findByEstado(String estado);
    List<Entrada> findByStripePaymentIntentId(String piId);
}