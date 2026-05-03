package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "paquetes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paquete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(length = 50)
    @Builder.Default
    private String estado = "CERRADO";

    @Column(name = "fecha_obtencion")
    private LocalDateTime fechaObtencion;

    @PrePersist
    protected void onCreate() {
        fechaObtencion = LocalDateTime.now();
    }
}