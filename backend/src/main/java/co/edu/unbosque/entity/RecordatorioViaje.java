package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recordatorios_viaje")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordatorioViaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "ciudad_destino", nullable = false, length = 100)
    private String ciudadDestino;

    @Column(name = "pais_destino", nullable = false, length = 100)
    private String paisDestino;

    /** Zona horaria del destino (ej. America/New_York). */
    @Column(name = "zona_horaria_destino", length = 50)
    private String zonaHorariaDestino;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    /** Si el viaje está vinculado a un estadio/partido específico. */
    @Column(name = "estadio_destino", length = 150)
    private String estadioDestino;

    @Column(length = 500)
    private String notas;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
