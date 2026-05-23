package co.edu.unbosque.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTOs agrupados para Backoffice (Admin + Compliance).
 */
public class BackofficeDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertaResponse {
        private Integer id;
        private String tipo;            // "INTERCAMBIO_EXCESIVO", "TRANSFERENCIA_RAPIDA", "API_ABUSO", etc.
        private String severidad;       // "ALTA" | "MEDIA" | "BAJA"
        private String descripcion;
        private Integer usuarioId;
        private String usuarioNombre;
        private String usuarioEmail;
        private String timestamp;
        private Boolean revisada;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogResponse {
        private Integer id;
        private String accion;
        private String timestamp;
        private String detalle;
        private String nivelRiesgo;
        private Boolean verificadoCompliance;
        private Integer usuarioId;
        private String usuarioNombre;
        private String hashIntegridad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogsFilterRequest {
        private String tipo;            // filtro por accion (LIKE)
        private Integer usuarioId;
        private String desde;           // ISO date
        private String hasta;
        private String nivelRiesgo;
        private Integer page;
        private Integer size;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioRiesgoResponse {
        private Integer id;
        private String nombre;
        private String email;
        private String rol;
        private String fechaRegistro;
        private Boolean bloqueado;
        private String razonBloqueo;
        private String fechaBloqueo;
        private Integer totalIntercambios;
        private Integer totalEntradasTransferidas;
        private Integer alertasAbiertas;
        private String nivelRiesgo;     // calculado
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BloquearUsuarioRequest {
        private String razon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultadoManualRequest {
        private Integer partidoId;
        private Integer golesLocal;
        private Integer golesVisitante;
        private String observacion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultadoManualResponse {
        private Integer partidoId;
        private Integer golesLocal;
        private Integer golesVisitante;
        private Integer prediccionesRecalculadas;
        private Integer pollasAfectadas;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComunicadoMasivoRequest {
        private String titulo;
        private String mensaje;
        private String segmento;        // "TODOS" | "CIUDAD" | "PARTIDO" | "ESTADIO" | "ROL"
        private String segmentoValor;   // valor del segmento (ej: "Monterrey", id partido, "SoFi Stadium")
        private List<String> canales;   // ["APP", "EMAIL", "PUSH"]
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComunicadoProgreso {
        private String id;              // tracking id
        private Integer totalDestinatarios;
        private Integer enviados;
        private Integer fallidos;
        private String estado;          // "EN_PROCESO" | "COMPLETADO" | "ERROR"
        private String iniciadoEn;
        private String finalizadoEn;
    }
}
