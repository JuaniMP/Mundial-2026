package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs_transaccionales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogsTransaccional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "hash_integridad", length = 255)
    private String hashIntegridad;

    @Column(name = "nivel_riesgo", length = 20)
    private String nivelRiesgo;

    @Column(name = "verificado_compliance")
    @Builder.Default
    private Boolean verificadoCompliance = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}