package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "agenda_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgendaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    /** Tipo: PARTIDO, VIAJE, ENTRADA, CUSTOM. */
    @Column(length = 30, nullable = false)
    @Builder.Default
    private String tipo = "CUSTOM";

    /** Prioridad para el feed: ALTA, MEDIA, BAJA. */
    @Column(length = 10, nullable = false)
    @Builder.Default
    private String prioridad = "MEDIA";

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    /** API ID de partido si tipo=PARTIDO. */
    @Column(name = "api_partido_id")
    private Long apiPartidoId;

    @Column(length = 100)
    private String ubicacion;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
