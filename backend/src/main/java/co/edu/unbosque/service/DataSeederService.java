package co.edu.unbosque.service;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        String[][] selecciones = {
            {"Argentina", "ARG", "CONMEBOL", "A"},
            {"Colombia", "COL", "CONMEBOL", "A"},
            {"Paraguay", "PAR", "CONMEBOL", "A"},
            {"Canadá", "CAN", "CONCACAF", "A"},
            {"Brasil", "BRA", "CONMEBOL", "B"},
            {"Uruguay", "URU", "CONMEBOL", "B"},
            {"Bolivia", "BOL", "CONMEBOL", "B"},
            {"México", "MEX", "CONCACAF", "B"},
            {"Ecuador", "ECU", "CONMEBOL", "C"},
            {"Perú", "PER", "CONMEBOL", "C"},
            {"Venezuela", "VEN", "CONMEBOL", "C"},
            {"Costa Rica", "CRC", "CONCACAF", "C"},
            {"Chile", "CHI", "CONMEBOL", "D"},
            {"Francia", "FRA", "UEFA", "D"},
            {"Italia", "ITA", "UEFA", "D"},
            {"Marruecos", "MAR", "CAF", "D"},
            {"España", "ESP", "UEFA", "E"},
            {"Alemania", "GER", "UEFA", "E"},
            {"Japón", "JPN", "AFC", "E"},
            {"Nigeria", "NGR", "CAF", "E"},
            {"Portugal", "POR", "UEFA", "F"},
            {"Países Bajos", "NED", "UEFA", "F"},
            {"Bélgica", "BEL", "UEFA", "F"},
            {"Irak", "IRQ", "AFC", "F"},
            {"Inglaterra", "ENG", "UEFA", "G"},
            {"Irán", "IRN", "AFC", "G"},
            {"Türkiye", "TUR", "UEFA", "G"},
            {"Ghana", "GHA", "CAF", "G"},
            {"Gales", "WAL", "UEFA", "H"},
            {"Sudáfrica", "RSA", "CAF", "H"},
            {"Tailandia", "THA", "AFC", "H"},
            {"Honduras", "HND", "CONCACAF", "H"}
        };

        for (String[] sel : selecciones) {
            if (seleccionRepository.findByCodigoFifa(sel[1]).isEmpty()) {
                seleccionRepository.save(Seleccion.builder()
                        .pais(sel[0])
                        .codigoFifa(sel[1])
                        .confederacion(sel[2])
                        .grupo(sel[3])
                        .historial("Equipo del Mundial 2026")
                        .banderaUrl("https://flagcdn.com/w640/" + sel[1].toLowerCase() + ".png")
                        .build());
            }
        }
        System.out.println("✓ Selecciones cargadas");
    }

    private void seedJugadores() {
        Seleccion argentina = seleccionRepository.findByPais("Argentina").orElse(null);
        Seleccion colombia = seleccionRepository.findByPais("Colombia").orElse(null);
        Seleccion brasil = seleccionRepository.findByPais("Brasil").orElse(null);

        if (argentina != null && jugadorRepository.findBySeleccion(argentina).isEmpty()) {
            String[][] jugadoresArg = {
                {"Lionel Messi", "Delantero", "10", "1987-06-24"},
                {"Ángel Di María", "Delantero", "11", "1988-02-14"},
                {"Gonzalo Montiel", "Defensa", "4", "1997-01-02"}
            };

            for (String[] jug : jugadoresArg) {
                jugadorRepository.save(Jugador.builder()
                        .nombreCompleto(jug[0])
                        .posicion(jug[1])
                        .dorsal(Integer.parseInt(jug[2]))
                        .fechaNacimiento(java.time.LocalDate.parse(jug[3]))
                        .nacionalidad("Argentina")
                        .seleccion(argentina)
                        .build());
            }
        }

        if (colombia != null && jugadorRepository.findBySeleccion(colombia).isEmpty()) {
            String[][] jugadoresCol = {
                {"James Rodríguez", "Centrocampista", "10", "1991-07-12"},
                {"Radamel Falcao", "Delantero", "9", "1986-02-10"},
                {"David Ospina", "Portero", "1", "1988-08-31"}
            };

            for (String[] jug : jugadoresCol) {
                jugadorRepository.save(Jugador.builder()
                        .nombreCompleto(jug[0])
                        .posicion(jug[1])
                        .dorsal(Integer.parseInt(jug[2]))
                        .fechaNacimiento(java.time.LocalDate.parse(jug[3]))
                        .nacionalidad("Colombia")
                        .seleccion(colombia)
                        .build());
            }
        }

        if (brasil != null && jugadorRepository.findBySeleccion(brasil).isEmpty()) {
            String[][] jugadoresBra = {
                {"Neymar Jr", "Delantero", "10", "1992-02-05"},
                {"Vinícius Júnior", "Delantero", "7", "2000-07-12"},
                {"Alisson Ramses", "Portero", "1", "1992-10-02"}
            };

            for (String[] jug : jugadoresBra) {
                jugadorRepository.save(Jugador.builder()
                        .nombreCompleto(jug[0])
                        .posicion(jug[1])
                        .dorsal(Integer.parseInt(jug[2]))
                        .fechaNacimiento(java.time.LocalDate.parse(jug[3]))
                        .nacionalidad("Brasil")
                        .seleccion(brasil)
                        .build());
            }
        }

        System.out.println("✓ Jugadores cargados");
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
