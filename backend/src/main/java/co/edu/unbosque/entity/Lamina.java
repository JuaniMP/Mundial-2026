package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "laminas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lamina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Número de lámina en el álbum (1–1020) */
    @Column(nullable = true)
    private Integer numero;

    /** Nombre visible: nombre del jugador, "Escudo", "Formación", "Trofeo", etc. */
    @Column(nullable = true, length = 200)
    private String nombre;

    /**
     * Tipo de lámina:
     * JUGADOR      — carta de jugador (18 por selección × 48 = 864)
     * ESCUDO_HOLO  — escudo holográfico (1 por selección × 48 = 48)
     * FORMACION    — foto de formación (1 por selección × 48 = 48)
     * ESPECIAL     — trofeo, balón, mascota, logos sede, estadios, etc. (~60)
     */
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String tipo = "JUGADOR";

    /** Rareza para el sistema de paquetes */
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String rareza = "COMUN";

    /** URL de imagen de la lámina */
    @Column(name = "imagen_url", length = 500)
    private String imagenUrl;

    // ── API identifiers (football-data.org) — sin FK a tablas locales ─────────

    /** ID del jugador en football-data.org (null para ESCUDO_HOLO, FORMACION, ESPECIAL) */
    @Column(name = "api_jugador_id")
    private Long apiJugadorId;

    /** Nombre completo del jugador (desnormalizado) */
    @Column(name = "nombre_jugador", length = 150)
    private String nombreJugador;

    /** ID de la selección en football-data.org */
    @Column(name = "api_seleccion_id")
    private Long apiSeleccionId;

    /** Nombre de la selección (desnormalizado) */
    @Column(name = "seleccion_nombre", length = 100)
    private String seleccionNombre;
}
