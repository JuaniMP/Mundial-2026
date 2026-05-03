package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "participantes_pollas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ParticipantePolla.ParticipantePollaId.class)
public class ParticipantePolla {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_polla", nullable = false)
    private Polla polla;

    @Column(name = "puntos_acumulados")
    @Builder.Default
    private Integer puntosAcumulados = 0;

    public static class ParticipantePollaId implements Serializable {
        private Integer usuario;
        private Integer polla;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            ParticipantePollaId that = (ParticipantePollaId) o;
            return Objects.equals(usuario, that.usuario) && Objects.equals(polla, that.polla);
        }

        @Override
        public int hashCode() {
            return Objects.hash(usuario, polla);
        }
    }
}