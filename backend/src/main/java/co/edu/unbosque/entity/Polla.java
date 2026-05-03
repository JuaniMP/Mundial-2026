package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "pollas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Polla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "codigo_acceso", nullable = false, unique = true, length = 20)
    private String codigoAcceso;

    @Column(name = "pozo_puntos")
    @Builder.Default
    private Integer pozoPuntos = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", nullable = false)
    private Usuario creador;

    @OneToMany(mappedBy = "polla", fetch = FetchType.LAZY)
    private List<ParticipantePolla> participantes;

    @OneToMany(mappedBy = "polla", fetch = FetchType.LAZY)
    private List<Prediccion> predicciones;
}