package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aliados_comerciales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AliadoComercial {

    @Id
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "nombre_empresa", nullable = false, length = 100)
    private String nombre;

    @Column(name = "tipo_servicio", nullable = false, length = 100)
    private String tipoServicio;

    @Column(name = "token_acceso", unique = true, length = 255)
    private String tokenAcceso;

    @Column(name = "estado_api", length = 50)
    @Builder.Default
    private String estado = "ACTIVO";

    @Column(name = "sitio_web", length = 255)
    private String sitioWeb;
}