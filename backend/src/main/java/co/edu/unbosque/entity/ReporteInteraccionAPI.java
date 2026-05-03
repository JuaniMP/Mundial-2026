package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "reportes_interaccion_api")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteInteraccionAPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aliado", nullable = false)
    private AliadoComercial aliado;

    @Column(nullable = false, length = 255)
    private String endpoint;

    @Column(name = "peticiones_exitosas")
    @Builder.Default
    private Integer peticionesExitosas = 0;

    @Column(name = "peticiones_fallidas")
    @Builder.Default
    private Integer peticionesFallidas = 0;

    @Column(name = "fecha_corte", nullable = false)
    private LocalDate fechaCorte;
}