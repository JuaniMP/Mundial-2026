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
    private final LaminaRepository laminaRepository;
    private final LaminaAlbumRepository laminaAlbumRepository;
    private final PartidoRepository partidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AlbumRepository albumRepository;
    private final PaqueteRepository paqueteRepository;
    private final NotificacionRepository notificacionRepository;
    private final IncidenteSoporteRepository incidenteSoporteRepository;
    private final AliadoComercialRepository aliadoComercialRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Random rng = new Random(42);

    private static final String[] SELECCIONES_FAVORITAS = {
        "Argentina", "Brasil", "Francia", "España", "Alemania",
        "Portugal", "Colombia", "Uruguay", "México", "Estados Unidos",
        "Canadá", "Inglaterra", "Italia", "Países Bajos", "Japón"
    };

    @Transactional
    public void seedDatabase() {
        seedWC2026StadiumsIfNeeded();
        seedSelecciones();
        seedJugadores();
        seedLaminas();

        if (rolRepository.count() > 0) {
            System.out.println("Roles ya existen. Verificando usuarios...");
            seedRoles();
            seedAllUsuarios();
            seedSedes();
            seedEstadios();
            seedPartidos();
            seedAliadosComerciales();
            return;
        }

        System.out.println("🌱 Iniciando seeding de base de datos...");
        seedRoles();
        seedAllUsuarios();
        seedSedes();
        seedEstadios();
        seedPartidos();
        seedAliadosComerciales();
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
                sedeRepository.save(Sede.builder().ciudad(sede[0]).pais(sede[1]).build());
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
            if (seleccion == null) continue;

            Set<String> existentes = new HashSet<>();
            for (Jugador j : jugadorRepository.findBySeleccion(seleccion)) {
                existentes.add(j.getNombreCompleto().trim().toLowerCase(Locale.ROOT));
            }

            for (Wc2026DataProvider.PlayerData pd : teamData.jugadores) {
                String key = pd.nombre.trim().toLowerCase(Locale.ROOT);
                if (existentes.contains(key)) continue;

                jugadorRepository.save(Jugador.builder()
                        .nombreCompleto(pd.nombre)
                        .posicion(pd.posicion)
                        .dorsal(pd.dorsal)
                        .fechaNacimiento(LocalDate.of(1990, 1, 1))
                        .nacionalidad(teamData.pais)
                        .fotoUrl("https://via.placeholder.com/150")
                        .popularidad(pd.popularidad)
                        .seleccion(seleccion)
                        .build());
                existentes.add(key);
                totalJugadores++;
            }
        }
        System.out.println("✓ Jugadores cargados (" + totalJugadores + " jugadores)");
    }

    private void seedLaminas() {
        List<Jugador> jugadores = jugadorRepository.findAll();
        if (jugadores.isEmpty()) {
            System.out.println("✓ Laminas omitidas: no hay jugadores");
            return;
        }

        Set<String> paisesMundial = new HashSet<>();
        for (Wc2026DataProvider.TeamData t : Wc2026DataProvider.getAllTeams()) {
            paisesMundial.add(t.pais);
        }

        List<Lamina> existentes = laminaRepository.findAll();
        for (Lamina l : existentes) {
            Jugador j = l.getJugador();
            if (j == null || j.getSeleccion() == null || !paisesMundial.contains(j.getSeleccion().getPais())) {
                laminaRepository.delete(l);
            }
        }

        Set<Integer> conLamina = new HashSet<>();
        for (Lamina l : laminaRepository.findAll()) {
            if (l.getJugador() != null) conLamina.add(l.getJugador().getId());
        }

        int nuevas = 0;
        for (Jugador jugador : jugadores) {
            if (jugador.getSeleccion() == null || !paisesMundial.contains(jugador.getSeleccion().getPais())) continue;
            if (conLamina.contains(jugador.getId())) continue;

            laminaRepository.save(Lamina.builder()
                    .rareza(determinarRareza(jugador))
                    .jugador(jugador)
                    .build());
            conLamina.add(jugador.getId());
            nuevas++;
        }
        System.out.println("✓ Laminas sincronizadas (" + nuevas + " nuevas, " + laminaRepository.count() + " totales)");
    }

    private String determinarRareza(Jugador jugador) {
        String nombre = jugador.getNombreCompleto() == null ? "" : jugador.getNombreCompleto();
        if (nombre.equals("Lionel Messi") || nombre.equals("Neymar Jr") || nombre.equals("Kylian Mbappé")
                || nombre.equals("Erling Haaland") || nombre.equals("Vinicius Jr")) {
            return "LEGENDARIO";
        }
        if (jugador.getPopularidad() != null && jugador.getPopularidad() >= 90) return "EPICO";
        if (jugador.getPopularidad() != null && jugador.getPopularidad() >= 75) return "RARO";
        if (jugador.getPopularidad() != null && jugador.getPopularidad() >= 55) return "POCO_COMUN";
        return "COMUN";
    }

    private void seedPartidos() {
        Seleccion argentina = seleccionRepository.findByPais("Argentina").orElse(null);
        Seleccion colombia = seleccionRepository.findByPais("Colombia").orElse(null);
        Seleccion brasil = seleccionRepository.findByPais("Brasil").orElse(null);
        Seleccion uruguay = seleccionRepository.findByPais("Uruguay").orElse(null);
        Estadio estadio = estadioRepository.findByNombre("MetLife Stadium")
                .or(() -> estadioRepository.findByNombre("Estadio El Campín"))
                .orElse(null);

        if (estadio != null && argentina != null && colombia != null && partidoRepository.count() == 0) {
            partidoRepository.save(Partido.builder()
                    .fechaHora(LocalDateTime.of(2026, 6, 11, 14, 0))
                    .ronda("Fase de Grupos")
                    .estado("PROGRAMADO")
                    .marcadorLocal(0).marcadorVisitante(0)
                    .estadio(estadio).seleccionLocal(argentina).seleccionVisitante(colombia)
                    .build());

            if (brasil != null && uruguay != null) {
                partidoRepository.save(Partido.builder()
                        .fechaHora(LocalDateTime.of(2026, 6, 12, 16, 0))
                        .ronda("Fase de Grupos")
                        .estado("PROGRAMADO")
                        .marcadorLocal(0).marcadorVisitante(0)
                        .estadio(estadio).seleccionLocal(brasil).seleccionVisitante(uruguay)
                        .build());
            }
        }
        System.out.println("✓ Partidos cargados");
    }

    private void seedAliadosComerciales() {
        if (aliadoComercialRepository.count() > 0) return;

        Object[][] aliados = {
            {"Adidas FIFA Partner", "Equipamiento deportivo", "tok_adidas_wc2026_x9k2"},
            {"Coca-Cola WC2026", "Bebidas y patrocinio", "tok_cocacola_wc2026_m3p7"},
            {"Qatar Airways Official", "Transporte aéreo", "tok_qatar_wc2026_z1q5"},
            {"Visa Inc.", "Pagos y servicios financieros", "tok_visa_wc2026_r8t4"},
            {"Hyundai Motor", "Movilidad oficial", "tok_hyundai_wc2026_v6n9"},
        };

        for (Object[] a : aliados) {
            aliadoComercialRepository.save(AliadoComercial.builder()
                    .nombre((String) a[0])
                    .tipoServicio((String) a[1])
                    .tokenAcceso((String) a[2])
                    .estado("ACTIVO")
                    .build());
        }
        System.out.println("✓ Aliados comerciales cargados");
    }

    // ── Usuarios (comprehensive seed) ────────────────────────────────────────

    private void seedAllUsuarios() {
        Rol adminRole = rolRepository.findByNombre("ADMIN").orElse(null);
        Rol aficionadoRole = rolRepository.findByNombre("AFICIONADO").orElse(null);
        Rol operadorRole = rolRepository.findByNombre("OPERADOR").orElse(null);
        Rol soporteRole = rolRepository.findByNombre("SOPORTE").orElse(null);
        Rol complianceRole = rolRepository.findByNombre("COMPLIANCE").orElse(null);

        List<Usuario> admins = seedAdmins(adminRole);
        seedOperadores(operadorRole);
        List<Usuario> agentes = seedAgentes(soporteRole);
        seedCompliance(complianceRole);
        List<Usuario> aficionados = seedAficionados(aficionadoRole);

        seedAlbumsYPaquetes(aficionados, agentes, admins);
        seedIncidentes(aficionados, agentes);
        seedNotificaciones(aficionados, admins);

        System.out.println("✓ Usuarios completos cargados");
    }

    private List<Usuario> seedAdmins(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Admin2026!");
        String[][] admins = {
            {"admin@mundial26.com", "Santiago Ramírez"},
            {"admin2@mundial26.com", "Valentina Torres"},
            {"admin3@mundial26.com", "Andrés Morales"},
        };
        List<Usuario> created = new ArrayList<>();
        for (String[] a : admins) {
            if (usuarioRepository.findByEmail(a[0]).isEmpty()) {
                created.add(usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota")
                        .seleccionFavorita("Colombia")
                        .build()));
            } else {
                usuarioRepository.findByEmail(a[0]).ifPresent(created::add);
            }
        }
        return created;
    }

    private void seedOperadores(Rol rol) {
        if (rol == null) return;
        String pass = passwordEncoder.encode("Operador2026!");
        String[][] operadores = {
            {"operador1@mundial26.com", "Carlos Herrera", "Argentina"},
            {"operador2@mundial26.com", "María Jiménez", "Brasil"},
            {"operador3@mundial26.com", "Felipe Gómez", "México"},
            {"operador4@mundial26.com", "Luisa Martínez", "España"},
            {"operador5@mundial26.com", "Jorge Vargas", "Francia"},
        };
        for (String[] o : operadores) {
            if (usuarioRepository.findByEmail(o[0]).isEmpty()) {
                usuarioRepository.save(Usuario.builder()
                        .email(o[0]).nombre(o[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(o[2])
                        .build());
            }
        }
    }

    private List<Usuario> seedAgentes(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Soporte2026!");
        String[][] agentes = {
            {"agente1@mundial26.com", "Laura Sánchez", "Colombia"},
            {"agente2@mundial26.com", "Martín Castro", "Argentina"},
            {"agente3@mundial26.com", "Sofía Rodríguez", "México"},
            {"agente4@mundial26.com", "Camilo Díaz", "Brasil"},
            {"agente5@mundial26.com", "Isabella López", "Portugal"},
            {"agente6@mundial26.com", "David Ruiz", "Estados Unidos"},
            {"agente7@mundial26.com", "Natalia Flores", "Uruguay"},
            {"agente8@mundial26.com", "Pablo Mendoza", "Canadá"},
        };
        List<Usuario> created = new ArrayList<>();
        for (String[] a : agentes) {
            if (usuarioRepository.findByEmail(a[0]).isEmpty()) {
                created.add(usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(a[2])
                        .build()));
            } else {
                usuarioRepository.findByEmail(a[0]).ifPresent(created::add);
            }
        }
        return created;
    }

    private void seedCompliance(Rol rol) {
        if (rol == null) return;
        String pass = passwordEncoder.encode("Compliance2026!");
        String[][] compliance = {
            {"compliance1@mundial26.com", "Ana Beltrán", "España"},
            {"compliance2@mundial26.com", "Roberto Cano", "Colombia"},
            {"compliance3@mundial26.com", "Paola Ríos", "Argentina"},
        };
        for (String[] c : compliance) {
            if (usuarioRepository.findByEmail(c[0]).isEmpty()) {
                usuarioRepository.save(Usuario.builder()
                        .email(c[0]).nombre(c[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(c[2])
                        .build());
            }
        }
    }

    private static final String[][] AFICIONADO_DATA = {
        {"javier.suarez@gmail.com", "Javier Suárez"},
        {"maria.garcia@hotmail.com", "María García"},
        {"pedro.lopez@yahoo.com", "Pedro López"},
        {"ana.martinez@gmail.com", "Ana Martínez"},
        {"carlos.rodriguez@gmail.com", "Carlos Rodríguez"},
        {"lucia.fernandez@outlook.com", "Lucía Fernández"},
        {"diego.gomez@gmail.com", "Diego Gómez"},
        {"sofia.herrera@gmail.com", "Sofía Herrera"},
        {"juan.torres@hotmail.com", "Juan Torres"},
        {"valentina.diaz@gmail.com", "Valentina Díaz"},
        {"andres.moreno@gmail.com", "Andrés Moreno"},
        {"camila.jimenez@yahoo.com", "Camila Jiménez"},
        {"sebastian.ruiz@gmail.com", "Sebastián Ruiz"},
        {"daniela.castro@gmail.com", "Daniela Castro"},
        {"miguel.vargas@hotmail.com", "Miguel Vargas"},
        {"paula.reyes@gmail.com", "Paula Reyes"},
        {"ricardo.medina@gmail.com", "Ricardo Medina"},
        {"natalia.silva@outlook.com", "Natalia Silva"},
        {"alejandro.rojas@gmail.com", "Alejandro Rojas"},
        {"isabella.mendoza@gmail.com", "Isabella Mendoza"},
        {"gabriel.ortiz@hotmail.com", "Gabriel Ortiz"},
        {"mariana.perez@gmail.com", "Mariana Pérez"},
        {"santiago.ramos@gmail.com", "Santiago Ramos"},
        {"fernanda.mora@yahoo.com", "Fernanda Mora"},
        {"nicolas.acosta@gmail.com", "Nicolás Acosta"},
        {"juliana.leon@gmail.com", "Juliana León"},
        {"david.guerrero@hotmail.com", "David Guerrero"},
        {"sara.rios@gmail.com", "Sara Ríos"},
        {"mateo.santos@gmail.com", "Mateo Santos"},
        {"manuela.campos@outlook.com", "Manuela Campos"},
        {"esteban.vega@gmail.com", "Esteban Vega"},
        {"catalina.soto@gmail.com", "Catalina Soto"},
        {"daniel.pino@hotmail.com", "Daniel Pino"},
        {"vanessa.luna@gmail.com", "Vanessa Luna"},
        {"oscar.navarro@gmail.com", "Óscar Navarro"},
        {"andrea.paredes@yahoo.com", "Andrea Paredes"},
        {"christian.espinoza@gmail.com", "Christian Espinoza"},
        {"tatiana.mora@gmail.com", "Tatiana Mora"},
        {"mauricio.bernal@hotmail.com", "Mauricio Bernal"},
        {"liliana.romero@gmail.com", "Liliana Romero"},
        {"rodrigo.zapata@gmail.com", "Rodrigo Zapata"},
        {"paola.burgos@outlook.com", "Paola Burgos"},
        {"felipe.arango@gmail.com", "Felipe Arango"},
        {"patricia.quevedo@gmail.com", "Patricia Quevedo"},
        {"ivan.rendon@hotmail.com", "Iván Rendón"},
        {"monica.cardona@gmail.com", "Mónica Cardona"},
        {"hector.ossa@gmail.com", "Héctor Ossa"},
        {"beatriz.parra@yahoo.com", "Beatriz Parra"},
        {"cesar.marulanda@gmail.com", "César Marulanda"},
        {"diana.pulido@gmail.com", "Diana Pulido"},
    };

    private List<Usuario> seedAficionados(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Aficionado2026!");
        List<Usuario> created = new ArrayList<>();
        for (int i = 0; i < AFICIONADO_DATA.length; i++) {
            String email = AFICIONADO_DATA[i][0];
            String nombre = AFICIONADO_DATA[i][1];
            String seleccion = SELECCIONES_FAVORITAS[i % SELECCIONES_FAVORITAS.length];
            if (usuarioRepository.findByEmail(email).isEmpty()) {
                created.add(usuarioRepository.save(Usuario.builder()
                        .email(email).nombre(nombre).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(seleccion)
                        .build()));
            } else {
                usuarioRepository.findByEmail(email).ifPresent(created::add);
            }
        }
        return created;
    }

    private void seedAlbumsYPaquetes(List<Usuario> aficionados, List<Usuario> agentes, List<Usuario> admins) {
        List<Lamina> todasLaminas = laminaRepository.findAll();
        if (todasLaminas.isEmpty()) return;

        for (Usuario u : aficionados) {
            if (albumRepository.existsByUsuarioId(u.getId())) continue;

            Album album = albumRepository.save(Album.builder()
                    .usuario(u)
                    .porcentajeCompletado(0f)
                    .laminasPegadas(0)
                    .build());

            int numLaminas = 20 + rng.nextInt(60);
            Collections.shuffle(todasLaminas, rng);
            List<Lamina> seleccionadas = todasLaminas.subList(0, Math.min(numLaminas, todasLaminas.size()));

            int pegadas = 0;
            for (Lamina l : seleccionadas) {
                boolean pegar = rng.nextBoolean();
                laminaAlbumRepository.save(LaminaAlbum.builder()
                        .album(album).lamina(l)
                        .estaPegada(pegar)
                        .cantidadRepetidas(pegar ? 0 : 1 + rng.nextInt(3))
                        .build());
                if (pegar) pegadas++;
            }

            float pct = todasLaminas.isEmpty() ? 0f : (pegadas * 100f / todasLaminas.size());
            album.setPorcentajeCompletado(Math.min(pct, 100f));
            album.setLaminasPegadas(pegadas);
            albumRepository.save(album);

            int numPaquetes = 1 + rng.nextInt(5);
            for (int p = 0; p < numPaquetes; p++) {
                paqueteRepository.save(Paquete.builder().usuario(u).estado("CERRADO").build());
            }
        }
        System.out.println("✓ Álbumes y paquetes cargados");
    }

    private void seedIncidentes(List<Usuario> aficionados, List<Usuario> agentes) {
        if (incidenteSoporteRepository.count() > 0) return;
        if (aficionados.isEmpty()) return;

        String[] descripciones = {
            "No puedo abrir mi álbum digital, la página se queda en carga infinita.",
            "Me cobraron dos veces la entrada para el partido Argentina vs Colombia.",
            "Mi código de paquete de láminas no funciona, dice 'ya utilizado'.",
            "El marcador del partido está desactualizado desde hace 3 horas.",
            "Olvidé mi contraseña y el correo de recuperación no llega.",
            "No encuentro mis láminas compradas en el inventario del álbum.",
            "Error al intentar intercambiar láminas con otro usuario.",
            "La aplicación se cierra sola cuando intento ver los estadios.",
            "Mi predicción no se guardó antes del inicio del partido.",
            "No puedo ver el historial de mis transacciones de paquetes.",
            "El avatar de mi perfil no se actualiza después de cambiarlo.",
            "Las notificaciones de partidos llegan con retraso de más de 1 hora.",
            "No puedo registrarme porque dice que mi email ya existe.",
            "La Superpolla muestra puntos incorrectos en el ranking.",
            "Tengo problemas para completar el pago de entradas con tarjeta.",
            "El mapa de estadios no carga en dispositivos móviles.",
        };

        String[] prioridades = {"ALTA", "ALTA", "MEDIA", "BAJA", "MEDIA"};
        String[] estados = {"ABIERTO", "EN_PROGRESO", "RESUELTO", "ABIERTO", "EN_PROGRESO"};

        for (int i = 0; i < descripciones.length; i++) {
            Usuario reportador = aficionados.get(i % aficionados.size());
            Usuario agente = agentes.isEmpty() ? null : agentes.get(i % agentes.size());
            String estado = estados[i % estados.length];
            boolean asignado = !estado.equals("ABIERTO") && agente != null;

            incidenteSoporteRepository.save(IncidenteSoporte.builder()
                    .descripcion(descripciones[i])
                    .prioridad(prioridades[i % prioridades.length])
                    .estado(estado)
                    .reportador(reportador)
                    .agenteSoporte(asignado ? agente : null)
                    .build());
        }
        System.out.println("✓ Incidentes de soporte cargados");
    }

    private void seedNotificaciones(List<Usuario> aficionados, List<Usuario> admins) {
        if (notificacionRepository.count() > 0) return;
        if (aficionados.isEmpty() || admins.isEmpty()) return;

        Usuario admin = admins.get(0);
        String[] mensajes = {
            "¡Bienvenido al HUB oficial del Mundial 2026! Completa tu álbum y gana premios.",
            "Tu álbum está al 30% completado. ¡Abre paquetes para conseguir más láminas!",
            "Recordatorio: el partido inaugural es el 11 de junio de 2026.",
            "Tienes 2 láminas repetidas disponibles para intercambiar.",
            "Nueva función disponible: ahora puedes predecir resultados y ganar puntos.",
            "Las entradas para la fase de grupos ya están disponibles.",
            "¡Nuevo paquete especial de láminas LEGENDARIAS disponible por tiempo limitado!",
        };

        String[] canales = {"APP", "EMAIL", "APP", "APP", "EMAIL", "APP", "APP"};

        for (int i = 0; i < aficionados.size(); i++) {
            Usuario dest = aficionados.get(i);
            String msg = mensajes[i % mensajes.length];
            notificacionRepository.save(Notificacion.builder()
                    .mensaje(msg)
                    .canal(canales[i % canales.length])
                    .destinatario(dest)
                    .emisor(admin)
                    .build());
        }
        System.out.println("✓ Notificaciones cargadas");
    }

    // ── WC 2026 Stadiums ─────────────────────────────────────────────────────

    private void seedWC2026StadiumsIfNeeded() {
        if (estadioRepository.findByNombre("MetLife Stadium").isPresent()) return;
        System.out.println("🏟️ Seeding estadios del Mundial 2026...");

        String[][] ciudades = {
            {"East Rutherford", "USA"}, {"Los Angeles", "USA"}, {"Dallas", "USA"},
            {"San Francisco", "USA"}, {"Kansas City", "USA"}, {"Houston", "USA"},
            {"Boston", "USA"}, {"Philadelphia", "USA"}, {"Charlotte", "USA"},
            {"Miami", "USA"}, {"Vancouver", "Canada"}, {"Toronto", "Canada"},
            {"Ciudad de México", "México"}, {"Monterrey", "México"}, {"Guadalajara", "México"},
        };
        for (String[] c : ciudades) {
            if (sedeRepository.findByCiudadAndPais(c[0], c[1]).isEmpty()) {
                sedeRepository.save(Sede.builder().ciudad(c[0]).pais(c[1]).build());
            }
        }

        Object[][] estadios = {
            {"MetLife Stadium",         "1 MetLife Stadium Dr, East Rutherford, NJ", 82500, "East Rutherford", "USA",     40.8136,  -74.0744},
            {"SoFi Stadium",            "1001 Stadium Dr, Inglewood, CA",            70240, "Los Angeles",     "USA",     33.9535, -118.3392},
            {"AT&T Stadium",            "1 AT&T Way, Arlington, TX",                 80000, "Dallas",          "USA",     32.7482,  -97.0928},
            {"Levi's Stadium",          "4900 Marie P DeBartolo Way, Santa Clara",   68500, "San Francisco",   "USA",     37.4034, -121.9697},
            {"Arrowhead Stadium",       "One Arrowhead Dr, Kansas City, MO",         73861, "Kansas City",     "USA",     39.0489,  -94.4839},
            {"NRG Stadium",             "1 NRG Pkwy, Houston, TX",                   72220, "Houston",         "USA",     29.6847,  -95.4107},
            {"Gillette Stadium",        "1 Patriot Pl, Foxborough, MA",              65878, "Boston",          "USA",     42.0909,  -71.2643},
            {"Lincoln Financial Field", "1 Lincoln Financial Field Way, Philadelphia",69796, "Philadelphia",   "USA",     39.9007,  -75.1676},
            {"Bank of America Stadium", "800 S Mint St, Charlotte, NC",              74867, "Charlotte",       "USA",     35.2258,  -80.8528},
            {"Hard Rock Stadium",       "347 Don Shula Dr, Miami Gardens, FL",       64767, "Miami",           "USA",     25.9580,  -80.2389},
            {"BC Place",                "777 Pacific Blvd, Vancouver, BC",           54500, "Vancouver",       "Canada",  49.2767, -123.1117},
            {"BMO Field",               "170 Princes Blvd, Toronto, ON",             30990, "Toronto",         "Canada",  43.6333,  -79.4167},
            {"Estadio Azteca",          "Calzada de Tlalpan 3465, Ciudad de México", 87523, "Ciudad de México","México",  19.3029,  -99.1505},
            {"Estadio BBVA",            "Av. Pablo Livas 2011, Guadalupe, Monterrey",53500, "Monterrey",       "México",  25.6694, -100.2438},
            {"Estadio Akron",           "Av. de las Rosas 3476, Zapopan, Jalisco",   49850, "Guadalajara",     "México",  20.6858, -103.4676},
        };

        for (Object[] est : estadios) {
            String nombre = (String) est[0];
            if (estadioRepository.findByNombre(nombre).isEmpty()) {
                Sede sede = sedeRepository.findByCiudadAndPais((String) est[3], (String) est[4])
                        .orElseGet(() -> sedeRepository.save(
                                Sede.builder().ciudad((String) est[3]).pais((String) est[4]).build()));
                estadioRepository.save(Estadio.builder()
                        .nombre(nombre).direccion((String) est[1])
                        .capacidad((int) est[2]).lat((double) est[5]).lng((double) est[6])
                        .sede(sede).build());
            }
        }
        System.out.println("✅ Estadios del Mundial 2026 cargados (15 venues)");
    }
}
