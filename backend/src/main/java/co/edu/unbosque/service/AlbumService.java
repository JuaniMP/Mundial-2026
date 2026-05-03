package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.*;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final LaminaRepository laminaRepository;
    private final LaminaAlbumRepository laminaAlbumRepository;
    private final PaqueteRepository paqueteRepository;
    private final UsuarioRepository usuarioRepository;

    private static final String[] RAREZAS = {"COMUN", "COMUN", "COMUN", "COMUN", "COMUN", "COMUN", "RARO", "RARO", "RARO", "EPICO", "EPICO", "LEGENDARIO"};
    private static final Random random = new Random();

    public AlbumResponse getAlbumByUsuario(Integer usuarioId) {
        Album album = albumRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Album no encontrado"));
        return toResponse(album);
    }

    private Album createAlbumEntity(Integer usuarioId) {
        if (albumRepository.existsByUsuarioId(usuarioId)) {
            throw new BadRequestException("El usuario ya tiene un album");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Album album = Album.builder()
                .usuario(usuario)
                .porcentajeCompletado(0f)
                .laminasPegadas(0)
                .build();

        return albumRepository.save(album);
    }

    @Transactional
    public AlbumResponse createAlbum(Integer usuarioId) {
        return toResponse(createAlbumEntity(usuarioId));
    }

    @Transactional
    public PaqueteResponse abrirPaquete(Integer usuarioId) {
        Album album = albumRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> createAlbumEntity(usuarioId));

        Paquete paquete = Paquete.builder()
                .usuario(album.getUsuario())
                .estado("ABIERTO")
                .build();
        paquete = paqueteRepository.save(paquete);

        List<Lamina> laminasObtenidas = generarLaminasAleatorias(5);

        for (Lamina lamina : laminasObtenidas) {
            LaminaAlbum laminaAlbum = laminaAlbumRepository
                    .findByAlbumIdAndLaminaId(album.getId(), lamina.getId())
                    .orElse(null);

            if (laminaAlbum != null) {
                laminaAlbum.setCantidadRepetidas(laminaAlbum.getCantidadRepetidas() + 1);
                laminaAlbumRepository.save(laminaAlbum);
            } else {
                LaminaAlbum nueva = LaminaAlbum.builder()
                        .album(album)
                        .lamina(lamina)
                        .estaPegada(false)
                        .cantidadRepetidas(1)
                        .build();
                laminaAlbumRepository.save(nueva);
            }
        }

        return PaqueteResponse.builder()
                .id(paquete.getId())
                .laminas(laminasObtenidas.stream().map(l -> l.getId()).collect(Collectors.toList()))
                .build();
    }

    public List<LaminaAlbumResponse> getLaminasAlbum(Integer usuarioId) {
        Album album = albumRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Album no encontrado"));

        return laminaAlbumRepository.findByAlbumId(album.getId()).stream()
                .map(this::toLaminaAlbumResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AlbumResponse pegarLamina(Integer usuarioId, Integer laminaId) {
        Album album = albumRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Album no encontrado"));

        LaminaAlbum laminaAlbum = laminaAlbumRepository
                .findByAlbumIdAndLaminaId(album.getId(), laminaId)
                .orElseThrow(() -> new ResourceNotFoundException("Lámina no encontrada en el album"));

        if (laminaAlbum.getCantidadRepetidas() < 1) {
            throw new BadRequestException("No tienes esta lamina");
        }

        laminaAlbum.setEstaPegada(true);
        laminaAlbumRepository.save(laminaAlbum);

        album.setLaminasPegadas(album.getLaminasPegadas() + 1);
        album.setPorcentajeCompletado((album.getLaminasPegadas() * 100f) / laminaRepository.count());
        albumRepository.save(album);

        return toResponse(album);
    }

    private List<Lamina> generarLaminasAleatorias(int cantidad) {
        List<Lamina> todasLaminas = laminaRepository.findAll();
        if (todasLaminas.isEmpty()) {
            throw new BadRequestException("No hay laminas disponibles");
        }

        for (int i = 0; i < cantidad; i++) {
            String rareza = RAREZAS[random.nextInt(RAREZAS.length)];
            List<Lamina> filtradas = laminaRepository.findByRareza(rareza);
            if (!filtradas.isEmpty()) {
                todasLaminas.add(filtradas.get(random.nextInt(filtradas.size())));
            }
        }

        return todasLaminas.stream().limit(cantidad).collect(Collectors.toList());
    }

    private AlbumResponse toResponse(Album album) {
        return AlbumResponse.builder()
                .id(album.getId())
                .idUsuario(album.getUsuario().getId())
                .porcentajeCompletado(album.getPorcentajeCompletado())
                .laminasPegadas(album.getLaminasPegadas())
                .build();
    }

    private LaminaAlbumResponse toLaminaAlbumResponse(LaminaAlbum la) {
        return LaminaAlbumResponse.builder()
                .idLamina(la.getLamina().getId())
                .nombreJugador(la.getLamina().getJugador().getNombreCompleto())
                .rareza(la.getLamina().getRareza())
                .estaPegada(la.getEstaPegada())
                .cantidadRepetidas(la.getCantidadRepetidas())
                .build();
    }
}