package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "perfil_preferencias")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerfilPreferencias {

    @Id
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    /** Lista CSV de códigos FIFA de selecciones favoritas. Ej: "ARG,COL,BRA". */
    @Column(name = "selecciones_favoritas", length = 500)
    private String seleccionesFavoritas;

    /** Lista CSV de nombres/ids de estadios favoritos. */
    @Column(name = "estadios_favoritos", length = 1000)
    private String estadiosFavoritos;

    /** Lista CSV de canales: APP, EMAIL, PUSH, SMS. */
    @Column(name = "canales_notificacion", length = 200)
    @Builder.Default
    private String canalesNotificacion = "APP";

    /** Si el usuario ya completó el wizard de preferencias. */
    @Column(name = "wizard_completado")
    @Builder.Default
    private Boolean wizardCompletado = false;

    @Column(name = "zona_horaria_preferida", length = 50)
    private String zonaHorariaPreferida;
}
