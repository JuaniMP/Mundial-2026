package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predicciones", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"id_usuario", "id_polla", "id_partido"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "goles_local", nullable = false)
    private Integer golesLocal;

    @Column(name = "goles_visitante", nullable = false)
    private Integer golesVisitante;

    @Column(name = "puntos_obtenidos")
    @Builder.Default
    private Integer puntosObtenidos = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_polla", nullable = false)
    private Polla polla;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_partido", nullable = false)
    private Partido partido;

    @Column(name = "fecha_prediccion")
    private LocalDateTime fechaPrediccion;

    @PrePersist
    protected void onCreate() {
        fechaPrediccion = LocalDateTime.now();
    }
}