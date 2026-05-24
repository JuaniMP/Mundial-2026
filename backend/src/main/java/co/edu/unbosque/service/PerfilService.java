package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class PerfilService {

    private final PerfilPreferenciasRepository perfilPreferenciasRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final RecordatorioViajeRepository recordatorioViajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;

    // ── Preferencias ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PreferenciasResponse getPreferencias(Integer usuarioId) {
        PerfilPreferencias p = perfilPreferenciasRepository.findByIdUsuario(usuarioId)
                .orElse(null);
        if (p == null) {
            return PreferenciasResponse.builder()
                    .seleccionesFavoritas(List.of())
                    .estadiosFavoritos(List.of())
                    .canalesNotificacion(List.of("APP"))
                    .zonaHorariaPreferida(null)
                    .wizardCompletado(false)
                    .idioma("es")
                    .build();
        }
        return PreferenciasResponse.builder()
                .seleccionesFavoritas(splitCsv(p.getSeleccionesFavoritas()))
                .estadiosFavoritos(splitCsv(p.getEstadiosFavoritos()))
                .canalesNotificacion(splitCsv(p.getCanalesNotificacion()))
                .zonaHorariaPreferida(p.getZonaHorariaPreferida())
                .wizardCompletado(Boolean.TRUE.equals(p.getWizardCompletado()))
                .idioma(p.getIdioma() == null ? "es" : p.getIdioma())
                .build();
    }

    @Transactional
    public PreferenciasResponse savePreferencias(Integer usuarioId, PreferenciasRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PerfilPreferencias p = perfilPreferenciasRepository.findByIdUsuario(usuarioId)
                .orElseGet(() -> PerfilPreferencias.builder()
                        .usuario(usuario)
                        .canalesNotificacion("APP")
                        .wizardCompletado(false)
                        .build());

        if (req.getSeleccionesFavoritas() != null)
            p.setSeleccionesFavoritas(joinCsv(req.getSeleccionesFavoritas()));
        if (req.getEstadiosFavoritos() != null)
            p.setEstadiosFavoritos(joinCsv(req.getEstadiosFavoritos()));
        if (req.getCanalesNotificacion() != null && !req.getCanalesNotificacion().isEmpty())
            p.setCanalesNotificacion(joinCsv(req.getCanalesNotificacion()));
        if (req.getZonaHorariaPreferida() != null)
            p.setZonaHorariaPreferida(req.getZonaHorariaPreferida());
        if (req.getWizardCompletado() != null)
            p.setWizardCompletado(req.getWizardCompletado());
        if (req.getIdioma() != null && (req.getIdioma().equals("es") || req.getIdioma().equals("en")))
            p.setIdioma(req.getIdioma());

        // También guardamos selección favorita única en Usuario (la primera) si hay
        if (req.getSeleccionesFavoritas() != null && !req.getSeleccionesFavoritas().isEmpty()) {
            usuario.setSeleccionFavorita(req.getSeleccionesFavoritas().get(0));
            usuarioRepository.save(usuario);
        }

        perfilPreferenciasRepository.save(p);
        return getPreferencias(usuarioId);
    }

    // ── Agenda ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AgendaItemResponse> getAgenda(Integer usuarioId) {
        return agendaItemRepository.findByUsuarioIdOrderByFechaInicioAsc(usuarioId).stream()
                .map(this::toAgendaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AgendaItemResponse addAgendaItem(Integer usuarioId, AgendaItemRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        AgendaItem item = AgendaItem.builder()
                .usuario(usuario)
                .titulo(req.getTitulo())
                .descripcion(req.getDescripcion())
                .tipo(req.getTipo() == null ? "CUSTOM" : req.getTipo())
                .prioridad(req.getPrioridad() == null ? "MEDIA" : req.getPrioridad())
                .fechaInicio(parseDateTime(req.getFechaInicio()))
                .fechaFin(req.getFechaFin() == null ? null : parseDateTime(req.getFechaFin()))
                .apiPartidoId(req.getApiPartidoId())
                .ubicacion(req.getUbicacion())
                .build();
        item = agendaItemRepository.save(item);
        return toAgendaResponse(item);
    }

    @Transactional
    public void deleteAgendaItem(Integer usuarioId, Integer itemId) {
        AgendaItem item = agendaItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item de agenda no encontrado"));
        if (!item.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Item de agenda no encontrado");
        }
        agendaItemRepository.delete(item);
    }

    // ── Viaje ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RecordatorioViajeResponse> getViajes(Integer usuarioId) {
        String zonaUsuario = resolveZonaUsuario(usuarioId);

        return recordatorioViajeRepository.findByUsuarioIdOrderByFechaInicioAsc(usuarioId).stream()
                .filter(this::isViajeValido)
                .map(v -> toViajeResponse(v, zonaUsuario))
                .collect(Collectors.toList());
    }

    @Transactional
    public RecordatorioViajeResponse addViaje(Integer usuarioId, RecordatorioViajeRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        RecordatorioViaje viaje = RecordatorioViaje.builder()
                .usuario(usuario)
                .ciudadDestino(req.getCiudadDestino())
                .paisDestino(req.getPaisDestino())
                .zonaHorariaDestino(req.getZonaHorariaDestino())
                .fechaInicio(LocalDate.parse(req.getFechaInicio()))
                .fechaFin(LocalDate.parse(req.getFechaFin()))
                .estadioDestino(req.getEstadioDestino())
                .notas(req.getNotas())
                .build();
        viaje = recordatorioViajeRepository.save(viaje);
            String zonaUsuario = resolveZonaUsuario(usuarioId);
        return toViajeResponse(viaje, zonaUsuario);
    }

    @Transactional
    public void deleteViaje(Integer usuarioId, Integer viajeId) {
        RecordatorioViaje viaje = recordatorioViajeRepository.findById(viajeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado"));
        if (!viaje.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Recordatorio no encontrado");
        }
        recordatorioViajeRepository.delete(viaje);
    }

    // ── Feed priorizado ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<FeedItemResponse> getFeed(Integer usuarioId) {
        LocalDateTime ahora = LocalDateTime.now();
        String zonaUsuario = resolveZonaUsuario(usuarioId);

        Stream<FeedItemResponse> agenda = agendaItemRepository
                .findUpcoming(usuarioId, ahora.minusHours(2))
                .stream()
            .filter(this::isAgendaValida)
                .map(a -> FeedItemResponse.builder()
                        .id("agenda-" + a.getId())
                        .origen("AGENDA")
                        .titulo(a.getTitulo())
                        .detalle(a.getDescripcion() == null ? "" : a.getDescripcion())
                        .prioridad(a.getPrioridad())
                        .cuando(a.getFechaInicio().toString())
                        .accionUrl("/profile")
                        .build());

        Stream<FeedItemResponse> viajes = recordatorioViajeRepository
                .findByUsuarioIdOrderByFechaInicioAsc(usuarioId).stream()
            .filter(this::isViajeValido)
                .filter(v -> !v.getFechaFin().isBefore(LocalDate.now().minusDays(1)))
                .map(v -> {
                    RecordatorioViajeResponse r = toViajeResponse(v, zonaUsuario);
                    return FeedItemResponse.builder()
                            .id("viaje-" + v.getId())
                            .origen("VIAJE")
                            .titulo("Viaje a " + v.getCiudadDestino())
                            .detalle(r.getAlerta() == null ? "" : r.getAlerta())
                            .prioridad(r.isEnCurso() ? "ALTA" : "MEDIA")
                            .cuando(v.getFechaInicio().atStartOfDay().toString())
                            .accionUrl("/profile")
                            .build();
                });

        Stream<FeedItemResponse> notis = notificacionRepository
                .findByDestinatarioId(usuarioId).stream()
                .sorted(Comparator.comparing(
                        (Notificacion n) -> n.getFechaEnvio() == null ? LocalDateTime.MIN : n.getFechaEnvio()
                ).reversed())
                .limit(10)
                .map(n -> FeedItemResponse.builder()
                        .id("noti-" + n.getId())
                        .origen("NOTIFICACION")
                        .titulo("Notificación")
                        .detalle(n.getMensaje())
                        .prioridad("BAJA")
                        .cuando(n.getFechaEnvio() == null ? "" : n.getFechaEnvio().toString())
                        .accionUrl(null)
                        .build());

        Map<String, Integer> rank = Map.of("ALTA", 0, "MEDIA", 1, "BAJA", 2);
        return Stream.of(agenda, viajes, notis)
                .flatMap(s -> s)
                .sorted(Comparator
                        .comparingInt((FeedItemResponse f) -> rank.getOrDefault(f.getPrioridad(), 3))
                        .thenComparing(FeedItemResponse::getCuando))
                .limit(20)
                .collect(Collectors.toList());
    }

    private String resolveZonaUsuario(Integer usuarioId) {
        PerfilPreferencias preferencias = perfilPreferenciasRepository.findByIdUsuario(usuarioId).orElse(null);
        if (preferencias != null && preferencias.getZonaHorariaPreferida() != null
                && !preferencias.getZonaHorariaPreferida().isBlank()) {
            return preferencias.getZonaHorariaPreferida();
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (usuario.getZonaHoraria() != null && !usuario.getZonaHoraria().isBlank()) {
            return usuario.getZonaHoraria();
        }

        return "UTC";
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return new ArrayList<>();
        return Arrays.stream(csv.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private String joinCsv(List<String> items) {
        if (items == null) return null;
        return items.stream().filter(Objects::nonNull).map(String::trim)
                .filter(s -> !s.isEmpty()).collect(Collectors.joining(","));
    }

    private LocalDateTime parseDateTime(String iso) {
        if (iso == null || iso.isBlank()) return null;
        try {
            return LocalDateTime.parse(iso);
        } catch (Exception e) {
            try {
                return OffsetDateTime.parse(iso).toLocalDateTime();
            } catch (Exception e2) {
                return LocalDate.parse(iso).atStartOfDay();
            }
        }
    }

    private AgendaItemResponse toAgendaResponse(AgendaItem a) {
        return AgendaItemResponse.builder()
                .id(a.getId())
                .titulo(a.getTitulo())
                .descripcion(a.getDescripcion())
                .tipo(a.getTipo())
                .prioridad(a.getPrioridad())
                .fechaInicio(a.getFechaInicio() == null ? null : a.getFechaInicio().toString())
                .fechaFin(a.getFechaFin() == null ? null : a.getFechaFin().toString())
                .apiPartidoId(a.getApiPartidoId())
                .ubicacion(a.getUbicacion())
                .build();
    }

    private RecordatorioViajeResponse toViajeResponse(RecordatorioViaje v, String zonaUsuario) {
        String offset = null;
        if (v.getZonaHorariaDestino() != null && !v.getZonaHorariaDestino().isBlank()) {
            try {
                ZoneId origen = ZoneId.of(zonaUsuario);
                ZoneId destino = ZoneId.of(v.getZonaHorariaDestino());
                int hOrigen = ZonedDateTime.now(origen).getOffset().getTotalSeconds() / 3600;
                int hDestino = ZonedDateTime.now(destino).getOffset().getTotalSeconds() / 3600;
                int diff = hDestino - hOrigen;
                offset = (diff >= 0 ? "+" : "") + diff + "h";
            } catch (Exception ignore) { /* zona inválida */ }
        }

        long diasEstimados = Math.max(1, ChronoUnit.DAYS.between(v.getFechaInicio(), v.getFechaFin()) + 1);
        long nochesEstimadas = Math.max(0, diasEstimados - 1);
        String duracionEstimada = diasEstimados + (diasEstimados == 1 ? " día" : " días")
            + " / "
            + nochesEstimadas + (nochesEstimadas == 1 ? " noche" : " noches");

        LocalDate hoy = LocalDate.now();
        boolean enCurso = !hoy.isBefore(v.getFechaInicio()) && !hoy.isAfter(v.getFechaFin());

        String alerta;
        long diasHastaInicio = hoy.until(v.getFechaInicio(), java.time.temporal.ChronoUnit.DAYS);
        if (enCurso) {
            alerta = "Estás en " + v.getCiudadDestino() + ". Verifica horarios locales antes de ir al estadio.";
        } else if (diasHastaInicio > 0 && diasHastaInicio <= 7) {
            alerta = "Faltan " + diasHastaInicio + " días para tu viaje a " + v.getCiudadDestino()
                    + (offset != null ? " (" + offset + " vs tu zona)." : ".");
        } else if (diasHastaInicio == 0) {
            alerta = "¡Hoy comienza tu viaje a " + v.getCiudadDestino() + "!";
        } else if (diasHastaInicio < 0 && hoy.isAfter(v.getFechaFin())) {
            alerta = "Viaje finalizado.";
        } else {
            alerta = "Viaje programado a " + v.getCiudadDestino()
                    + (offset != null ? " (" + offset + " vs tu zona)." : ".");
        }

        return RecordatorioViajeResponse.builder()
                .id(v.getId())
                .ciudadDestino(v.getCiudadDestino())
                .paisDestino(v.getPaisDestino())
                .zonaHorariaDestino(v.getZonaHorariaDestino())
                .fechaInicio(v.getFechaInicio().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .fechaFin(v.getFechaFin().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .estadioDestino(v.getEstadioDestino())
                .notas(v.getNotas())
                .offsetHoras(offset)
                .duracionEstimada(duracionEstimada)
                .enCurso(enCurso)
                .alerta(alerta)
                .build();
    }

    private boolean isViajeValido(RecordatorioViaje viaje) {
        return viaje != null
                && viaje.getFechaInicio() != null
                && viaje.getFechaFin() != null
                && viaje.getCiudadDestino() != null
                && !viaje.getCiudadDestino().isBlank()
                && viaje.getPaisDestino() != null
                && !viaje.getPaisDestino().isBlank();
    }

    private boolean isAgendaValida(AgendaItem agendaItem) {
        return agendaItem != null
                && agendaItem.getFechaInicio() != null
                && agendaItem.getTitulo() != null
                && !agendaItem.getTitulo().isBlank();
    }
}
