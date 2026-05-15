package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "administradores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Administrador {

    @Id
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Builder.Default
    private Boolean superadmin = false;

    @Column(length = 100)
    private String departamento;

    @Column(name = "requiere_mfa")
    @Builder.Default
    private Boolean requiereMfa = true;

    @Column(name = "fecha_ultimo_cambio_clave")
    private LocalDateTime fechaUltimoCambioClave;
}
