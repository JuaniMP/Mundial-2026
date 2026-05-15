package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aficionados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Aficionado {

    @Id
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "seleccion_favorita", length = 50)
    private String seleccionFavorita;

    @Column(name = "album_completitud_pct")
    @Builder.Default
    private Float albumCompletitudPct = 0f;

    @Column(name = "num_intercambios_diarios")
    @Builder.Default
    private Integer numIntercambiosDiarios = 0;
}
