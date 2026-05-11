package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "jugadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Jugador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(nullable = false, length = 50)
    private String posicion;

    private Integer dorsal;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    private String nacionalidad;

    @Column(name = "minutos_jugados")
    @Builder.Default
    private Integer minutosJugados = 0;

    @Builder.Default
    private Integer goles = 0;

    @Column(name = "foto_url", length = 255)
    private String fotoUrl;

    @Column(name = "popularidad")
    @Builder.Default
    private Integer popularidad = 50;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_seleccion", nullable = false)
    private Seleccion seleccion;
}