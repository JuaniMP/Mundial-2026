package co.edu.unbosque.service;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import co.edu.unbosque.util.Wc2026DataProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DataSeederService {

    private final RolRepository rolRepository;
    private final SedeRepository sedeRepository;
    private final EstadioRepository estadioRepository;
    private final SeleccionRepository seleccionRepository;
    private final JugadorRepository jugadorRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void seedDatabase() {
        // Always try to seed WC 2026 stadiums (has its own guard)
        seedWC2026StadiumsIfNeeded();

        // Verificar si ya hay datos
        if (rolRepository.count() > 0) {
            System.out.println("Base de datos ya contiene datos. Seeding omitido.");
            return;
        }

        System.out.println("🌱 Iniciando seeding de base de datos...");
        seedRoles();
        seedUsuarios();
        seedSedes();
        seedEstadios();
        seedSelecciones();
        seedJugadores();
        seedPartidos();
        System.out.println("✅ Seeding completado exitosamente");
    }

    private void seedRoles() {
        String[] roleNames = {"AFICIONADO", "OPERADOR", "SOPORTE", "COMPLIANCE", "ADMIN", "ALIADO"};
        for (String name : roleNames) {
            if (rolRepository.findByNombre(name).isEmpty()) {
                rolRepository.save(Rol.builder().nombre(name).build());
            }
        }
        System.out.println("✓ Roles cargados");
    }

    private void seedSedes() {
        String[][] sedes = {
            {"Bogotá", "Colombia"},
            {"Medellín", "Colombia"},
            {"Cali", "Colombia"},
            {"Barranquilla", "Colombia"},
            {"Bucaramanga", "Colombia"}
        };

        for (String[] sede : sedes) {
            if (sedeRepository.findByCiudadAndPais(sede[0], sede[1]).isEmpty()) {
                sedeRepository.save(Sede.builder()
                        .ciudad(sede[0])
                        .pais(sede[1])
                        .build());
            }
        }
        System.out.println("✓ Sedes cargadas");
    }

    private void seedEstadios() {
        Sede bogota = sedeRepository.findByCiudadAndPais("Bogotá", "Colombia").orElse(null);
        Sede medellin = sedeRepository.findByCiudadAndPais("Medellín", "Colombia").orElse(null);
        Sede cali = sedeRepository.findByCiudadAndPais("Cali", "Colombia").orElse(null);
        Sede barranquilla = sedeRepository.findByCiudadAndPais("Barranquilla", "Colombia").orElse(null);

        Object[][] estadios = {
            {"Estadio El Campín", "Carrera 7 # 24-40, Bogotá", 36000, bogota},
            {"Estadio Manuel Murillo Toro", "Carrera 2 # 13-05, Ibagué", 31000, bogota},
            {"Estadio Metropolitano", "Calle 48 # 104-50, Medellín", 36000, medellin},
            {"Estadio Atanasio Girardot", "Carrera 70 # 47-96, Medellín", 45000, medellin},
            {"Estadio Pascual Guerrero", "Carrera 1W # 19-05, Cali", 41000, cali},
            {"Estadio Metropolitano Roberto Meléndez", "Calle 26, Barranquilla", 46000, barranquilla}
        };

        for (Object[] est : estadios) {
            if (estadioRepository.findByNombre((String) est[0]).isEmpty()) {
                estadioRepository.save(Estadio.builder()
                        .nombre((String) est[0])
                        .direccion((String) est[1])
                        .capacidad((Integer) est[2])
                        .sede((Sede) est[3])
                        .build());
            }
        }
        System.out.println("✓ Estadios cargados");
    }

    private void seedSelecciones() {
        List<Wc2026DataProvider.TeamData> teams = Wc2026DataProvider.getAllTeams();
        
        for (Wc2026DataProvider.TeamData teamData : teams) {
            if (seleccionRepository.findByCodigoFifa(teamData.codigoFifa).isEmpty()) {
                seleccionRepository.save(Seleccion.builder()
                        .pais(teamData.pais)
                        .codigoFifa(teamData.codigoFifa)
                        .confederacion(teamData.confederacion)
                        .grupo(teamData.grupo)
                        .historial("Equipo del Mundial 2026")
                        .banderaUrl("https://flagcdn.com/w640/" + teamData.codigoFifa.toLowerCase() + ".png")
                        .build());
            }
        }
        System.out.println("✓ Selecciones cargadas (" + teams.size() + " equipos)");
    }

    private void seedJugadores() {
        List<Wc2026DataProvider.TeamData> teams = Wc2026DataProvider.getAllTeams();
        int totalJugadores = 0;
        
        for (Wc2026DataProvider.TeamData teamData : teams) {
            Seleccion seleccion = seleccionRepository.findByPais(teamData.pais).orElse(null);
            
            if (seleccion != null && jugadorRepository.findBySeleccion(seleccion).isEmpty()) {
                for (Wc2026DataProvider.PlayerData playerData : teamData.jugadores) {
                    jugadorRepository.save(Jugador.builder()
                            .nombreCompleto(playerData.nombre)
                            .posicion(playerData.posicion)
                            .dorsal(playerData.dorsal)
                            .fechaNacimiento(LocalDate.of(1990, 1, 1)) // Placeholder
                            .nacionalidad(teamData.pais)
                            .fotoUrl("https://via.placeholder.com/150")
                            .popularidad(playerData.popularidad)
                            .seleccion(seleccion)
                            .build());
                    totalJugadores++;
                }
            }
        }
        System.out.println("✓ Jugadores cargados (" + totalJugadores + " jugadores)");
    }

    private void seedPartidos() {
        Seleccion argentina = seleccionRepository.findByPais("Argentina").orElse(null);
        Seleccion colombia = seleccionRepository.findByPais("Colombia").orElse(null);
        Seleccion brasil = seleccionRepository.findByPais("Brasil").orElse(null);
        Seleccion uruguay = seleccionRepository.findByPais("Uruguay").orElse(null);

        Estadio estadio = estadioRepository.findByNombre("Estadio El Campín").orElse(null);

        if (estadio != null && argentina != null && colombia != null && partidoRepository.count() == 0) {
            partidoRepository.save(Partido.builder()
                    .fechaHora(LocalDateTime.of(2026, 6, 8, 14, 0))
                    .ronda("Fase de Grupos")
                    .estado("PROGRAMADO")
                    .marcadorLocal(0)
                    .marcadorVisitante(0)
                    .estadio(estadio)
                    .seleccionLocal(argentina)
                    .seleccionVisitante(colombia)
                    .build());

            if (brasil != null && uruguay != null) {
                partidoRepository.save(Partido.builder()
                        .fechaHora(LocalDateTime.of(2026, 6, 9, 16, 0))
                        .ronda("Fase de Grupos")
                        .estado("PROGRAMADO")
                        .marcadorLocal(0)
                        .marcadorVisitante(0)
                        .estadio(estadio)
                        .seleccionLocal(brasil)
                        .seleccionVisitante(uruguay)
                        .build());
            }
        }

        System.out.println("✓ Partidos cargados");
    }

    // ── WC 2026 Stadiums ──────────────────────────────────────────────────────

    /**
     * Seeds the 16 real FIFA World Cup 2026 stadiums (USA / Canada / Mexico)
     * with hardcoded coordinates. Safe to call multiple times — guard prevents
     * re-seeding if MetLife Stadium already exists.
     */
    private void seedWC2026StadiumsIfNeeded() {
        if (estadioRepository.findByNombre("MetLife Stadium").isPresent()) {
            return; // Already migrated
        }
        System.out.println("🏟️ Seeding estadios del Mundial 2026...");

        // Sedes (host cities) — ciudad, pais
        String[][] ciudades = {
            {"East Rutherford", "USA"},
            {"Los Angeles",     "USA"},
            {"Dallas",          "USA"},
            {"San Francisco",   "USA"},
            {"Los Angeles",     "USA"},   // Pasadena — same pais, different ciudad key
            {"Kansas City",     "USA"},
            {"Houston",         "USA"},
            {"Boston",          "USA"},
            {"Philadelphia",    "USA"},
            {"Charlotte",       "USA"},
            {"Miami",           "USA"},
            {"Vancouver",       "Canada"},
            {"Toronto",         "Canada"},
            {"Ciudad de México","México"},
            {"Monterrey",       "México"},
            {"Guadalajara",     "México"},
        };
        for (String[] c : ciudades) {
            if (sedeRepository.findByCiudadAndPais(c[0], c[1]).isEmpty()) {
                sedeRepository.save(Sede.builder().ciudad(c[0]).pais(c[1]).build());
            }
        }

        // Stadiums: nombre, direccion, capacidad, ciudad, pais, lat, lng
        Object[][] estadios = {
            {"MetLife Stadium",          "1 MetLife Stadium Dr, East Rutherford, NJ", 82500, "East Rutherford", "USA",              40.8136,  -74.0744},
            {"SoFi Stadium",             "1001 Stadium Dr, Inglewood, CA",            70240, "Los Angeles",     "USA",              33.9535, -118.3392},
            {"AT&T Stadium",             "1 AT&T Way, Arlington, TX",                 80000, "Dallas",          "USA",              32.7482,  -97.0928},
            {"Levi's Stadium",           "4900 Marie P DeBartolo Way, Santa Clara, CA",68500,"San Francisco",   "USA",              37.4034, -121.9697},
            {"Rose Bowl",                "1001 Rose Bowl Dr, Pasadena, CA",           92542, "Los Angeles",     "USA",              34.1613, -118.1676},
            {"Arrowhead Stadium",        "One Arrowhead Dr, Kansas City, MO",         73861, "Kansas City",     "USA",              39.0489,  -94.4839},
            {"NRG Stadium",              "1 NRG Pkwy, Houston, TX",                   72220, "Houston",         "USA",              29.6847,  -95.4107},
            {"Gillette Stadium",         "1 Patriot Pl, Foxborough, MA",              65878, "Boston",          "USA",              42.0909,  -71.2643},
            {"Lincoln Financial Field",  "1 Lincoln Financial Field Way, Philadelphia",69796, "Philadelphia",   "USA",              39.9007,  -75.1676},
            {"Bank of America Stadium",  "800 S Mint St, Charlotte, NC",              74867, "Charlotte",       "USA",              35.2258,  -80.8528},
            {"Hard Rock Stadium",        "347 Don Shula Dr, Miami Gardens, FL",       64767, "Miami",           "USA",              25.9580,  -80.2389},
            {"BC Place",                 "777 Pacific Blvd, Vancouver, BC",           54500, "Vancouver",       "Canada",           49.2767, -123.1117},
            {"BMO Field",                "170 Princes' Blvd, Toronto, ON",            30990, "Toronto",         "Canada",           43.6333,  -79.4167},
            {"Estadio Azteca",           "Calzada de Tlalpan 3465, Ciudad de México", 87523, "Ciudad de México","México",           19.3029,  -99.1505},
            {"Estadio BBVA",             "Av. Pablo Livas 2011, Guadalupe, Monterrey",53500, "Monterrey",       "México",           25.6694, -100.2438},
            {"Estadio Akron",            "Av. de las Rosas 3476, Zapopan, Jalisco",   49850, "Guadalajara",     "México",           20.6858, -103.4676},
        };

        for (Object[] est : estadios) {
            String nombre   = (String) est[0];
            String dir      = (String) est[1];
            int    cap      = (int)    est[2];
            String ciudad   = (String) est[3];
            String pais     = (String) est[4];
            double lat      = (double) est[5];
            double lng      = (double) est[6];

            if (estadioRepository.findByNombre(nombre).isEmpty()) {
                Sede sede = sedeRepository.findByCiudadAndPais(ciudad, pais).orElseGet(() ->
                        sedeRepository.save(Sede.builder().ciudad(ciudad).pais(pais).build())
                );
                estadioRepository.save(Estadio.builder()
                        .nombre(nombre)
                        .direccion(dir)
                        .capacidad(cap)
                        .lat(lat)
                        .lng(lng)
                        .sede(sede)
                        .build());
            }
        }
        System.out.println("✅ Estadios del Mundial 2026 cargados (16 venues)");
    }

    private void seedUsuarios() {
        Rol adminRole = rolRepository.findByNombre("ADMIN").orElse(null);
        Rol aficionadoRole = rolRepository.findByNombre("AFICIONADO").orElse(null);
        Rol operadorRole = rolRepository.findByNombre("OPERADOR").orElse(null);

        if (adminRole != null && usuarioRepository.findByEmail("admin@test.com").isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                    .nombre("Admin Usuario")
                    .email("admin@test.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .rol(adminRole)
                    .zonaHoraria("America/Bogota")
                    .seleccionFavorita("Argentina")
                    .build());
        }

        if (aficionadoRole != null && usuarioRepository.findByEmail("aficionado@test.com").isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                    .nombre("Aficionado Prueba")
                    .email("aficionado@test.com")
                    .passwordHash(passwordEncoder.encode("aficionado123"))
                    .rol(aficionadoRole)
                    .zonaHoraria("America/Bogota")
                    .seleccionFavorita("Colombia")
                    .build());
        }

        if (operadorRole != null && usuarioRepository.findByEmail("operador@test.com").isEmpty()) {
            usuarioRepository.save(Usuario.builder()
                    .nombre("Operador Sistema")
                    .email("operador@test.com")
                    .passwordHash(passwordEncoder.encode("operador123"))
                    .rol(operadorRole)
                    .zonaHoraria("America/Bogota")
                    .seleccionFavorita("Brasil")
                    .build());
        }

        System.out.println("✓ Usuarios de prueba cargados");
    }
}
