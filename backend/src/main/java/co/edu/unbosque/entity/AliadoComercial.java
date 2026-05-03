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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "tipo_servicio", nullable = false, length = 100)
    private String tipoServicio;

    @Column(name = "token_acceso", unique = true, length = 255)
    private String tokenAcceso;

    @Column(length = 50)
    @Builder.Default
    private String estado = "ACTIVO";
}