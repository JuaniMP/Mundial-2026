package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "partidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(nullable = false, length = 50)
    private String ronda;

    @Column(length = 50)
    @Builder.Default
    private String estado = "PROGRAMADO";

    @Column(name = "marcador_local")
    @Builder.Default
    private Integer marcadorLocal = 0;

    @Column(name = "marcador_visitante")
    @Builder.Default
    private Integer marcadorVisitante = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estadio", nullable = false)
    private Estadio estadio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seleccion_local", nullable = false)
    private Seleccion seleccionLocal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seleccion_visitante", nullable = false)
    private Seleccion seleccionVisitante;

    @OneToMany(mappedBy = "partido", fetch = FetchType.LAZY)
    private List<Entrada> entradas;
}