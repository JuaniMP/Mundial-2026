package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "estadios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estadio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(nullable = true)
    private Double lat;

    @Column(nullable = true)
    private Double lng;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sede", nullable = false)
    private Sede sede;

    @OneToMany(mappedBy = "estadio", fetch = FetchType.LAZY)
    private List<Partido> partidos;
}