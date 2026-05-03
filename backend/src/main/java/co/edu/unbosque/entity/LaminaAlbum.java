package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "laminas_album")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(LaminaAlbum.LaminaAlbumId.class)
public class LaminaAlbum {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_album", nullable = false)
    private Album album;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lamina", nullable = false)
    private Lamina lamina;

    @Column(name = "esta_pegada")
    @Builder.Default
    private Boolean estaPegada = false;

    @Column(name = "cantidad_repetidas")
    @Builder.Default
    private Integer cantidadRepetidas = 0;

    public static class LaminaAlbumId implements Serializable {
        private Integer album;
        private Integer lamina;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            LaminaAlbumId that = (LaminaAlbumId) o;
            return Objects.equals(album, that.album) && Objects.equals(lamina, that.lamina);
        }

        @Override
        public int hashCode() {
            return Objects.hash(album, lamina);
        }
    }
}