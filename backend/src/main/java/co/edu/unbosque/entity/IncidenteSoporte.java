package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidentes_soporte")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidenteSoporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 50)
    @Builder.Default
    private String estado = "ABIERTO";

    @Column(length = 20)
    private String prioridad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reportador", nullable = false)
    private Usuario reportador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agente_soporte")
    private Usuario agenteSoporte;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}