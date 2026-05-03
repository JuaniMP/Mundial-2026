package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "albumes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Album {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "porcentaje_completado")
    @Builder.Default
    private Float porcentajeCompletado = 0f;

    @Column(name = "laminas_pegadas")
    @Builder.Default
    private Integer laminasPegadas = 0;

    @OneToMany(mappedBy = "album", fetch = FetchType.LAZY)
    private List<LaminaAlbum> laminas;
}