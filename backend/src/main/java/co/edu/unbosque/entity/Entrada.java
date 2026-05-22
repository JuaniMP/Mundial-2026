package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "entradas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Entrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_qr", nullable = false, unique = true, length = 255)
    private String codigoQr;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false, length = 50)
    private String estado;

    // ── Stripe Payment ────────────────────────────────────────────────────────

    @Column(name = "stripe_payment_intent_id", length = 100)
    private String stripePaymentIntentId;

    @Column(name = "stripe_status", length = 50)
    private String stripeStatus;

    @Column(name = "cantidad")
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "total", precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "fecha_compra")
    private LocalDateTime fechaCompra;

    @Column(name = "email_comprador", length = 255)
    private String emailComprador;

    // ── Match info (API reference — sin FK a tabla local) ────────────────────

    /** ID del partido en football-data.org */
    @Column(name = "api_partido_id")
    private Long apiPartidoId;

    @Column(name = "seleccion_local", length = 100)
    private String seleccionLocal;

    @Column(name = "seleccion_visitante", length = 100)
    private String seleccionVisitante;

    @Column(name = "estadio_nombre", length = 100)
    private String estadioNombre;

    @Column(name = "ronda", length = 50)
    private String ronda;

    // ── Relations ─────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario_comprador")
    private Usuario usuarioComprador;
}
