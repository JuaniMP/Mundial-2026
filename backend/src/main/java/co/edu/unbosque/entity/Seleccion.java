package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "selecciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seleccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String pais;

    @Column(name = "codigo_fifa", nullable = false, unique = true, length = 3)
    private String codigoFifa;

    @Column(nullable = false, length = 50)
    private String confederacion;

    @Column(nullable = false, length = 1)
    private String grupo;

    @Column(columnDefinition = "TEXT")
    private String historial;

    @Column(name = "bandera_url", length = 255)
    private String banderaUrl;

    @OneToMany(mappedBy = "seleccion", fetch = FetchType.LAZY)
    private List<Jugador> jugadores;
}