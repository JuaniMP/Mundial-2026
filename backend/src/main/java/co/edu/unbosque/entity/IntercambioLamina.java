package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "intercambios_laminas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntercambioLamina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_solicitante", nullable = false)
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_receptor", nullable = false)
    private Usuario receptor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lamina_ofrecida", nullable = false)
    private Lamina laminaOfrecida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lamina_solicitada", nullable = false)
    private Lamina laminaSolicitada;

    @Column(length = 50)
    @Builder.Default
    private String estado = "PENDIENTE";

    @Column(name = "fecha_solicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @PrePersist
    protected void onCreate() {
        fechaSolicitud = LocalDateTime.now();
    }
}