package co.edu.unbosque.service;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DataSeederService {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final IncidenteSoporteRepository incidenteSoporteRepository;
    private final AliadoComercialRepository aliadoComercialRepository;
    private final PasswordEncoder passwordEncoder;

    // New repositories for extended seeding
    private final PerfilPreferenciasRepository perfilPreferenciasRepository;
    private final PollaRepository pollaRepository;
    private final ParticipantePollaRepository participantePollaRepository;
    private final PrediccionRepository prediccionRepository;
    private final EntradaRepository entradaRepository;
    private final AgendaItemRepository agendaItemRepository;
    private final RecordatorioViajeRepository recordatorioViajeRepository;
    private final LogsTransaccionalRepository logsTransaccionalRepository;
    private final ReporteComplianceRepository reporteComplianceRepository;
    private final ReporteInteraccionAPIRepository reporteInteraccionAPIRepository;
    private final IntercambioLaminaRepository intercambioLaminaRepository;
    private final AlbumRepository albumRepository;
    private final LaminaRepository laminaRepository;
    private final LaminaAlbumRepository laminaAlbumRepository;
    private final PaqueteRepository paqueteRepository;
    private final AficionadoRepository aficionadoRepository;
    private final AdministradorRepository administradorRepository;

    private static final String[] SELECCIONES_FAVORITAS = {
        "Argentina", "Brasil", "Francia", "España", "Alemania",
        "Portugal", "Colombia", "Uruguay", "México", "Estados Unidos",
        "Canadá", "Inglaterra", "Italia", "Países Bajos", "Japón"
    };

    // ── 16 teams: {apiSeleccionId, nombre, players CSV (15 names)} ─────────────

    private static final Object[][] EQUIPOS = {
        {7L,    "Argentina",      new String[]{"Lionel Messi","Emiliano Martínez","Cristian Romero","Nicolás Otamendi","Marcos Acuña","Rodrigo De Paul","Leandro Paredes","Alexis Mac Allister","Ángel Di María","Julián Álvarez","Lautaro Martínez","Paulo Dybala","Giovani Lo Celso","Nahuel Molina","Germán Pezzella"}},
        {6L,    "Brasil",         new String[]{"Alisson Becker","Marquinhos","Thiago Silva","Danilo","Alex Sandro","Casemiro","Lucas Paquetá","Neymar Jr","Vinícius Jr","Rodrygo","Gabriel Martinelli","Raphinha","Éder Militão","Bremer","Endrick"}},
        {773L,  "Francia",        new String[]{"Hugo Lloris","Dayot Upamecano","Raphaël Varane","Theo Hernández","Jules Koundé","Aurelien Tchouaméni","Adrien Rabiot","Antoine Griezmann","Kylian Mbappé","Ousmane Dembélé","Marcus Thuram","Randal Kolo Muani","Benjamin Pavard","William Saliba","Eduardo Camavinga"}},
        {760L,  "España",         new String[]{"David Raya","Aymeric Laporte","Robin Le Normand","Alejandro Balde","Daniel Carvajal","Pedri","Rodri","Gavi","Álvaro Morata","Dani Olmo","Mikel Oyarzabal","Ferran Torres","Lamine Yamal","Nico Williams","Martín Zubimendi"}},
        {759L,  "Alemania",       new String[]{"Manuel Neuer","Antonio Rüdiger","Jonathan Tah","Joshua Kimmich","Leon Goretzka","İlkay Gündoğan","Leroy Sané","Thomas Müller","Kai Havertz","Florian Wirtz","Jamal Musiala","Toni Kroos","Serge Gnabry","Niklas Süle","David Raum"}},
        {765L,  "Portugal",       new String[]{"Rui Patrício","Rúben Dias","Pepe","João Cancelo","Nuno Mendes","João Palhinha","Bernardo Silva","Bruno Fernandes","Cristiano Ronaldo","Rafael Leão","João Félix","Diogo Jota","Vitinha","Gonçalo Ramos","Rúben Neves"}},
        {780L,  "Colombia",       new String[]{"Camilo Vargas","Davinson Sánchez","Yerry Mina","William Tesillo","Stefan Medina","Juan Cuadrado","Wilmar Barrios","James Rodríguez","Luis Díaz","Radamel Falcao","Cucho Hernández","Rafael Santos Borré","Jhon Córdoba","Jhon Jáder Durán","Mateus Uribe"}},
        {788L,  "Uruguay",        new String[]{"Fernando Muslera","Diego Godín","José María Giménez","Martín Cáceres","Matías Viña","Lucas Torreira","Rodrigo Bentancur","Giorgian De Arrascaeta","Luis Suárez","Edinson Cavani","Darwin Núñez","Federico Valverde","Facundo Pellistri","Maxi Gómez","Sebastián Coates"}},
        {764L,  "México",         new String[]{"Guillermo Ochoa","Héctor Moreno","César Montes","Jorge Sánchez","Jesús Gallardo","Héctor Herrera","Carlos Rodríguez","Edson Álvarez","Andrés Guardado","Hirving Lozano","Raúl Jiménez","Henry Martín","Santiago Giménez","Alexis Vega","Roberto Alvarado"}},
        {762L,  "Estados Unidos", new String[]{"Matt Turner","Sergiño Dest","Walker Zimmerman","Miles Robinson","Antonee Robinson","Tyler Adams","Yunus Musah","Weston McKennie","Christian Pulisic","Timothy Weah","Josh Sargent","Giovanni Reyna","Brenden Aaronson","Ricardo Pepi","DeAndre Yedlin"}},
        {798L,  "Canadá",         new String[]{"Milan Borjan","Kamal Miller","Alistair Johnston","Richie Laryea","Sam Adekugbe","Atiba Hutchinson","Stephen Eustáquio","Jonathan Osorio","Alphonso Davies","Cyle Larin","Jonathan David","Tajon Buchanan","Liam Millar","Ismaël Koné","Derek Cornelius"}},
        {770L,  "Inglaterra",     new String[]{"Jordan Pickford","Kyle Walker","John Stones","Harry Maguire","Luke Shaw","Declan Rice","Jude Bellingham","Bukayo Saka","Harry Kane","Raheem Sterling","Phil Foden","Marcus Rashford","Trent Alexander-Arnold","Eric Dier","Jack Grealish"}},
        {784L,  "Italia",         new String[]{"Gianluigi Donnarumma","Alessandro Bastoni","Giorgio Chiellini","Giovanni Di Lorenzo","Federico Dimarco","Jorginho","Marco Verratti","Nicolò Barella","Federico Chiesa","Lorenzo Insigne","Ciro Immobile","Matteo Politano","Bryan Cristante","Alessandro Florenzi","Giacomo Raspadori"}},
        {825L,  "Países Bajos",   new String[]{"Bart Verbruggen","Stefan de Vrij","Virgil van Dijk","Daley Blind","Denzel Dumfries","Frenkie de Jong","Tijjani Reijnders","Teun Koopmeiners","Cody Gakpo","Memphis Depay","Donyell Malen","Steven Bergwijn","Nathan Aké","Xavi Simons","Wout Weghorst"}},
        {800L,  "Japón",          new String[]{"Shuichi Gonda","Maya Yoshida","Yuto Nagatomo","Hiroki Sakai","Ko Itakura","Wataru Endo","Junya Ito","Takumi Minamino","Kaoru Mitoma","Ritsu Doan","Daichi Kamada","Takehiro Tomiyasu","Hidemasa Morita","Ayase Ueda","Ao Tanaka"}},
        {1030L, "Marruecos",      new String[]{"Yassine Bounou","Romain Saïss","Nayef Aguerd","Achraf Hakimi","Noussair Mazraoui","Selim Amallah","Azzedine Ounahi","Sofyan Amrabat","Youssef En-Nesyri","Hakim Ziyech","Zakaria Aboukhlal","Abde Ezzalzouli","Yahia Attiyat Allah","Amine Harit","Sofiane Boufal"}},
    };

    private static final String[] ESPECIALES = {
        "Trofeo FIFA World Cup 2026","Balón Oficial Adidas","Mascota Tezcat",
        "MetLife Stadium","SoFi Stadium","AT&T Stadium","Levi's Stadium","Rose Bowl",
        "Estadio Azteca","BC Place","Estadio AKRON","BMO Field","Q2 Stadium",
        "Hard Rock Stadium","Gillette Stadium","Lincoln Financial Field",
        "Empower Field at Mile High","Arrowhead Stadium","NRG Stadium","Lumen Field",
        "Logo FIFA World Cup 2026","Logo USA 2026","Logo Canadá 2026","Logo México 2026",
        "Sede Nueva York","Sede Los Ángeles","Sede Dallas","Sede San Francisco",
        "Sede Miami","Sede Kansas City","Sede Houston","Sede Seattle",
        "Sede Denver","Sede Filadelfia","Sede Boston","Sede Vancouver",
        "Sede Toronto","Sede Ciudad de México","Sede Monterrey","Sede Guadalajara",
        "Carta Especial Messi Gold","Carta Especial Mbappé Gold","Carta Especial Ronaldo Gold",
        "Carta Especial Neymar Gold","Carta Especial Mbappé Holo","Carta Especial Kane Gold",
        "Debut Historical","Historia del Torneo"
    };

    @Transactional
    public void seedDatabase() {
        seedRoles();
        seedAllUsuarios();
        seedMasterAccounts();
        seedAliadosComerciales(rolRepository.findByNombre("ALIADO").orElse(null));
        seedLaminas();
        seedAlbumes();
        seedPerfilPreferencias();
        seedPollas();
        seedEntradas();
        seedAgendaItems();
        seedRecordatoriosViaje();
        seedLogsTransaccionales();
        seedReportesCompliance();
        seedReportesInteraccionAPI();
        seedIntercambiosLaminas();
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

    private void seedAliadosComerciales(Rol rolAliado) {
        if (rolAliado == null) return;
        String pass = passwordEncoder.encode("Aliado2026!");
        // {email, nombre, tipoServicio, token, sitioWeb}
        String[][] aliados = {
            {"adidas@mundial26.com",      "Adidas",       "Equipamiento deportivo",         "tok_adidas_wc2026_x9k2",    "https://www.adidas.com"},
            {"cocacola@mundial26.com",    "Coca-Cola",    "Bebidas y patrocinio",           "tok_cocacola_wc2026_m3p7",  "https://www.coca-cola.com"},
            {"qatarairways@mundial26.com","Qatar Airways","Transporte aéreo",               "tok_qatar_wc2026_z1q5",     "https://www.qatarairways.com"},
            {"visa@mundial26.com",        "Visa",         "Pagos y servicios financieros",  "tok_visa_wc2026_r8t4",      "https://www.visa.com"},
            {"hyundai@mundial26.com",     "Hyundai",      "Movilidad oficial",              "tok_hyundai_wc2026_v6n9",   "https://www.hyundai.com"},
            {"nike@mundial26.com",        "Nike",         "Equipamiento deportivo",         "tok_nike_wc2026_p2a1",      "https://www.nike.com"},
            {"mcdonalds@mundial26.com",   "McDonald's",   "Alimentación y patrocinio",      "tok_mcdonalds_wc2026_f4b3", "https://www.mcdonalds.com"},
            {"budweiser@mundial26.com",   "Budweiser",    "Bebidas",                        "tok_budweiser_wc2026_d7c8", "https://www.budweiser.com"},
            {"hisense@mundial26.com",     "Hisense",      "Electrónica oficial",            "tok_hisense_wc2026_e9g2",   "https://www.hisense.com"},
            {"wanda@mundial26.com",       "Wanda Group",  "Inversión y entretenimiento",    "tok_wanda_wc2026_w5h6",     "https://www.wanda.cn"},
        };

        for (String[] a : aliados) {
            Usuario usuario = usuarioRepository.findByEmail(a[0]).orElseGet(() ->
                usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rolAliado)
                        .zonaHoraria("America/Bogota").build()));

            if (!aliadoComercialRepository.existsById(usuario.getId())) {
                aliadoComercialRepository.save(AliadoComercial.builder()
                        .usuario(usuario).nombre(a[1])
                        .tipoServicio(a[2]).tokenAcceso(a[3]).estado("ACTIVO")
                        .sitioWeb(a[4]).build());
            } else {
                // Update sitioWeb if aliado already exists but lacks the URL
                aliadoComercialRepository.findById(usuario.getId()).ifPresent(ac -> {
                    if (ac.getSitioWeb() == null || ac.getSitioWeb().isBlank()) {
                        ac.setSitioWeb(a[4]);
                        aliadoComercialRepository.save(ac);
                    }
                });
            }
        }
        System.out.println("✓ Aliados comerciales cargados (10 total)");
    }

    // ── Usuarios ─────────────────────────────────────────────────────────────

    private void seedAllUsuarios() {
        Rol adminRole     = rolRepository.findByNombre("ADMIN").orElse(null);
        Rol aficionadoRole = rolRepository.findByNombre("AFICIONADO").orElse(null);
        Rol operadorRole  = rolRepository.findByNombre("OPERADOR").orElse(null);
        Rol soporteRole   = rolRepository.findByNombre("SOPORTE").orElse(null);
        Rol complianceRole = rolRepository.findByNombre("COMPLIANCE").orElse(null);

        List<Usuario> admins     = seedAdmins(adminRole);
        seedOperadores(operadorRole);
        List<Usuario> agentes    = seedAgentes(soporteRole);
        seedCompliance(complianceRole);
        List<Usuario> aficionados = seedAficionados(aficionadoRole);

        seedIncidentes(aficionados, agentes);
        seedNotificaciones(aficionados, admins);

        System.out.println("✓ Usuarios completos cargados");
    }

    private List<Usuario> seedAdmins(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Admin2026!");
        String[][] admins = {
            {"admin@mundial26.com",  "Santiago Ramírez"},
            {"admin2@mundial26.com", "Valentina Torres"},
            {"admin3@mundial26.com", "Andrés Morales"},
        };
        List<Usuario> created = new ArrayList<>();
        for (String[] a : admins) {
            usuarioRepository.findByEmail(a[0]).ifPresentOrElse(
                created::add,
                () -> created.add(usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita("Colombia").build()))
            );
        }
        return created;
    }

    private void seedOperadores(Rol rol) {
        if (rol == null) return;
        String pass = passwordEncoder.encode("Operador2026!");
        String[][] operadores = {
            {"operador1@mundial26.com", "Carlos Herrera",  "Argentina"},
            {"operador2@mundial26.com", "María Jiménez",   "Brasil"},
            {"operador3@mundial26.com", "Felipe Gómez",    "México"},
            {"operador4@mundial26.com", "Luisa Martínez",  "España"},
            {"operador5@mundial26.com", "Jorge Vargas",    "Francia"},
        };
        for (String[] o : operadores) {
            if (usuarioRepository.findByEmail(o[0]).isEmpty()) {
                usuarioRepository.save(Usuario.builder()
                        .email(o[0]).nombre(o[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(o[2]).build());
            }
        }
    }

    private List<Usuario> seedAgentes(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Soporte2026!");
        String[][] agentes = {
            {"agente1@mundial26.com", "Laura Sánchez",    "Colombia"},
            {"agente2@mundial26.com", "Martín Castro",    "Argentina"},
            {"agente3@mundial26.com", "Sofía Rodríguez",  "México"},
            {"agente4@mundial26.com", "Camilo Díaz",      "Brasil"},
            {"agente5@mundial26.com", "Isabella López",   "Portugal"},
            {"agente6@mundial26.com", "David Ruiz",       "Estados Unidos"},
            {"agente7@mundial26.com", "Natalia Flores",   "Uruguay"},
            {"agente8@mundial26.com", "Pablo Mendoza",    "Canadá"},
        };
        List<Usuario> created = new ArrayList<>();
        for (String[] a : agentes) {
            usuarioRepository.findByEmail(a[0]).ifPresentOrElse(
                created::add,
                () -> created.add(usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(a[2]).build()))
            );
        }
        return created;
    }

    private void seedCompliance(Rol rol) {
        if (rol == null) return;
        String pass = passwordEncoder.encode("Compliance2026!");
        String[][] compliance = {
            {"compliance1@mundial26.com", "Ana Beltrán",    "España"},
            {"compliance2@mundial26.com", "Roberto Cano",   "Colombia"},
            {"compliance3@mundial26.com", "Paola Ríos",     "Argentina"},
        };
        for (String[] c : compliance) {
            if (usuarioRepository.findByEmail(c[0]).isEmpty()) {
                usuarioRepository.save(Usuario.builder()
                        .email(c[0]).nombre(c[1]).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(c[2]).build());
            }
        }
    }

    private static final String[][] AFICIONADO_DATA = {
        {"javier.suarez@gmail.com",       "Javier Suárez"},
        {"maria.garcia@hotmail.com",       "María García"},
        {"pedro.lopez@yahoo.com",          "Pedro López"},
        {"ana.martinez@gmail.com",         "Ana Martínez"},
        {"carlos.rodriguez@gmail.com",     "Carlos Rodríguez"},
        {"lucia.fernandez@outlook.com",    "Lucía Fernández"},
        {"diego.gomez@gmail.com",          "Diego Gómez"},
        {"sofia.herrera@gmail.com",        "Sofía Herrera"},
        {"juan.torres@hotmail.com",        "Juan Torres"},
        {"valentina.diaz@gmail.com",       "Valentina Díaz"},
        {"andres.moreno@gmail.com",        "Andrés Moreno"},
        {"camila.jimenez@yahoo.com",       "Camila Jiménez"},
        {"sebastian.ruiz@gmail.com",       "Sebastián Ruiz"},
        {"daniela.castro@gmail.com",       "Daniela Castro"},
        {"miguel.vargas@hotmail.com",      "Miguel Vargas"},
        {"paula.reyes@gmail.com",          "Paula Reyes"},
        {"ricardo.medina@gmail.com",       "Ricardo Medina"},
        {"natalia.silva@outlook.com",      "Natalia Silva"},
        {"alejandro.rojas@gmail.com",      "Alejandro Rojas"},
        {"isabella.mendoza@gmail.com",     "Isabella Mendoza"},
        {"gabriel.ortiz@hotmail.com",      "Gabriel Ortiz"},
        {"mariana.perez@gmail.com",        "Mariana Pérez"},
        {"santiago.ramos@gmail.com",       "Santiago Ramos"},
        {"fernanda.mora@yahoo.com",        "Fernanda Mora"},
        {"nicolas.acosta@gmail.com",       "Nicolás Acosta"},
        {"juliana.leon@gmail.com",         "Juliana León"},
        {"david.guerrero@hotmail.com",     "David Guerrero"},
        {"sara.rios@gmail.com",            "Sara Ríos"},
        {"mateo.santos@gmail.com",         "Mateo Santos"},
        {"manuela.campos@outlook.com",     "Manuela Campos"},
        {"esteban.vega@gmail.com",         "Esteban Vega"},
        {"catalina.soto@gmail.com",        "Catalina Soto"},
        {"daniel.pino@hotmail.com",        "Daniel Pino"},
        {"vanessa.luna@gmail.com",         "Vanessa Luna"},
        {"oscar.navarro@gmail.com",        "Óscar Navarro"},
        {"andrea.paredes@yahoo.com",       "Andrea Paredes"},
        {"christian.espinoza@gmail.com",   "Christian Espinoza"},
        {"tatiana.mora@gmail.com",         "Tatiana Mora"},
        {"mauricio.bernal@hotmail.com",    "Mauricio Bernal"},
        {"liliana.romero@gmail.com",       "Liliana Romero"},
        {"rodrigo.zapata@gmail.com",       "Rodrigo Zapata"},
        {"paola.burgos@outlook.com",       "Paola Burgos"},
        {"felipe.arango@gmail.com",        "Felipe Arango"},
        {"patricia.quevedo@gmail.com",     "Patricia Quevedo"},
        {"ivan.rendon@hotmail.com",        "Iván Rendón"},
        {"monica.cardona@gmail.com",       "Mónica Cardona"},
        {"hector.ossa@gmail.com",          "Héctor Ossa"},
        {"beatriz.parra@yahoo.com",        "Beatriz Parra"},
        {"cesar.marulanda@gmail.com",      "César Marulanda"},
        {"diana.pulido@gmail.com",         "Diana Pulido"},
    };

    private List<Usuario> seedAficionados(Rol rol) {
        if (rol == null) return Collections.emptyList();
        String pass = passwordEncoder.encode("Aficionado2026!");
        List<Usuario> created = new ArrayList<>();
        for (int i = 0; i < AFICIONADO_DATA.length; i++) {
            String email   = AFICIONADO_DATA[i][0];
            String nombre  = AFICIONADO_DATA[i][1];
            String seleccion = SELECCIONES_FAVORITAS[i % SELECCIONES_FAVORITAS.length];
            usuarioRepository.findByEmail(email).ifPresentOrElse(
                created::add,
                () -> created.add(usuarioRepository.save(Usuario.builder()
                        .email(email).nombre(nombre).passwordHash(pass).rol(rol)
                        .zonaHoraria("America/Bogota").seleccionFavorita(seleccion).build()))
            );
        }
        return created;
    }

    // ── Master accounts ───────────────────────────────────────────────────────

    private void seedMasterAccounts() {
        seedSuperAdmin();
        seedMasterAficionado();
    }

    private void seedSuperAdmin() {
        Rol adminRol = rolRepository.findByNombre("ADMIN").orElse(null);
        if (adminRol == null) return;
        String email = "superadmin@mundial2026.com";
        Usuario u = usuarioRepository.findByEmail(email).orElseGet(() ->
            usuarioRepository.save(Usuario.builder()
                    .email(email).nombre("Super Administrador")
                    .passwordHash(passwordEncoder.encode("SuperAdmin2026!"))
                    .rol(adminRol).zonaHoraria("America/Bogota").build()));
        if (!administradorRepository.existsById(u.getId())) {
            administradorRepository.save(Administrador.builder()
                    .usuario(u).superadmin(true)
                    .departamento("Dirección General").requiereMfa(false).build());
        }
        System.out.println("✓ Super admin cargado: " + email);
    }

    private void seedMasterAficionado() {
        Rol aficionadoRol = rolRepository.findByNombre("AFICIONADO").orElse(null);
        if (aficionadoRol == null) return;
        String email = "juamepi90@gmail.com";
        usuarioRepository.findByEmail(email).ifPresentOrElse(
            u -> { /* already exists */ },
            () -> {
                Usuario u = usuarioRepository.save(Usuario.builder()
                        .email(email).nombre("Juanita Masterclass")
                        .passwordHash(passwordEncoder.encode("***REMOVED***"))
                        .rol(aficionadoRol).zonaHoraria("America/Bogota")
                        .seleccionFavorita("Colombia").build());
                aficionadoRepository.save(Aficionado.builder()
                        .usuario(u).seleccionFavorita("Colombia")
                        .albumCompletitudPct(26.5625f).build());
            }
        );
        System.out.println("✓ Master aficionado cargado: " + email);
    }

    // ── Laminas (320 stickers) ────────────────────────────────────────────────

    @Transactional
    public void seedLaminas() {
        if (laminaRepository.count() > 0) return;

        String[] rarezasJugador = {"COMUN","COMUN","COMUN","COMUN","COMUN","COMUN","COMUN","COMUN",
                                   "RARO","RARO","RARO","RARO","EPICO","EPICO","LEGENDARIO"};
        int numero = 1;

        for (Object[] equipo : EQUIPOS) {
            Long apiId   = (Long) equipo[0];
            String pais  = (String) equipo[1];
            String[] jugadores = (String[]) equipo[2];

            // Jugadores (15 per team)
            for (int j = 0; j < jugadores.length; j++) {
                laminaRepository.save(Lamina.builder()
                        .numero(numero++).nombre(jugadores[j]).tipo("JUGADOR")
                        .rareza(rarezasJugador[j % rarezasJugador.length])
                        .nombreJugador(jugadores[j]).apiSeleccionId(apiId)
                        .seleccionNombre(pais).build());
            }
            // Escudo holográfico
            laminaRepository.save(Lamina.builder()
                    .numero(numero++).nombre("Escudo " + pais).tipo("ESCUDO_HOLO")
                    .rareza("RARO").apiSeleccionId(apiId).seleccionNombre(pais).build());
            // Formación
            laminaRepository.save(Lamina.builder()
                    .numero(numero++).nombre("Formación " + pais).tipo("FORMACION")
                    .rareza("COMUN").apiSeleccionId(apiId).seleccionNombre(pais).build());
        }

        // Especiales
        for (String especial : ESPECIALES) {
            laminaRepository.save(Lamina.builder()
                    .numero(numero++).nombre(especial).tipo("ESPECIAL")
                    .rareza("EPICO").build());
        }

        System.out.println("✓ Láminas cargadas (" + laminaRepository.count() + " total)");
    }

    // ── Albums con láminas ─────────────────────────────────────────────────────

    @Transactional
    public void seedAlbumes() {
        if (albumRepository.count() > 0) return;
        List<Lamina> todasLaminas = laminaRepository.findAll();
        if (todasLaminas.isEmpty()) return;

        // Album para el master aficionado con 85 pegadas + 30 repetidas
        usuarioRepository.findByEmail("juamepi90@gmail.com").ifPresent(master -> {
            Album album = albumRepository.save(Album.builder()
                    .usuario(master).laminasPegadas(85)
                    .porcentajeCompletado(85f * 100f / todasLaminas.size()).build());

            for (int i = 0; i < Math.min(115, todasLaminas.size()); i++) {
                boolean pegada = i < 85;
                laminaAlbumRepository.save(LaminaAlbum.builder()
                        .album(album).lamina(todasLaminas.get(i))
                        .estaPegada(pegada).cantidadRepetidas(pegada ? 1 : 1).build());
            }
            // 8 repetidas adicionales (intercambiables)
            for (int i = 0; i < Math.min(8, todasLaminas.size() - 115); i++) {
                laminaAlbumRepository.save(LaminaAlbum.builder()
                        .album(album).lamina(todasLaminas.get(115 + i))
                        .estaPegada(false).cantidadRepetidas(2).build());
            }
            // 12 paquetes abiertos
            for (int i = 0; i < 12; i++) {
                paqueteRepository.save(Paquete.builder()
                        .usuario(master).estado("ABIERTO").build());
            }
            System.out.println("✓ Álbum master cargado: 85 láminas pegadas, 12 paquetes");
        });

        // Albums básicos para los primeros 10 aficionados seed (30% completado)
        int count = 0;
        for (String[] af : AFICIONADO_DATA) {
            if (count++ >= 10) break;
            usuarioRepository.findByEmail(af[0]).ifPresent(u -> {
                if (!albumRepository.existsByUsuarioId(u.getId())) {
                    int numPegadas = 20 + new Random().nextInt(30);
                    Album album = albumRepository.save(Album.builder()
                            .usuario(u).laminasPegadas(numPegadas)
                            .porcentajeCompletado(numPegadas * 100f / todasLaminas.size()).build());
                    for (int i = 0; i < Math.min(numPegadas, todasLaminas.size()); i++) {
                        laminaAlbumRepository.save(LaminaAlbum.builder()
                                .album(album).lamina(todasLaminas.get(i))
                                .estaPegada(true).cantidadRepetidas(1).build());
                    }
                }
            });
        }
        System.out.println("✓ Álbumes adicionales cargados");
    }

    // ── Perfil preferencias ────────────────────────────────────────────────────

    @Transactional
    public void seedPerfilPreferencias() {
        if (perfilPreferenciasRepository.count() > 0) return;

        String[] idiomas   = {"es", "es", "en", "fr", "es"};
        String[] canales   = {"APP,EMAIL", "APP", "APP,EMAIL,PUSH", "EMAIL", "APP,PUSH"};
        String[] zonas     = {"America/Bogota","America/Mexico_City","America/New_York",
                              "Europe/Madrid","America/Lima"};

        // Preference for master user first
        usuarioRepository.findByEmail("juamepi90@gmail.com").ifPresent(u ->
            perfilPreferenciasRepository.save(PerfilPreferencias.builder()
                    .usuario(u).idioma("es").zonaHorariaPreferida("America/Bogota")
                    .seleccionesFavoritas("COL,ARG,BRA").estadiosFavoritos("MetLife Stadium,Estadio Azteca")
                    .canalesNotificacion("APP,EMAIL,PUSH").wizardCompletado(true).build())
        );

        // Preferences for seeded aficionados
        int idx = 0;
        for (String[] af : AFICIONADO_DATA) {
            int i = idx++;
            usuarioRepository.findByEmail(af[0]).ifPresent(u -> {
                if (perfilPreferenciasRepository.findByIdUsuario(u.getId()).isEmpty()) {
                    String selec = SELECCIONES_FAVORITAS[i % SELECCIONES_FAVORITAS.length]
                            .substring(0, 3).toUpperCase();
                    perfilPreferenciasRepository.save(PerfilPreferencias.builder()
                            .usuario(u).idioma(idiomas[i % idiomas.length])
                            .zonaHorariaPreferida(zonas[i % zonas.length])
                            .seleccionesFavoritas(selec)
                            .canalesNotificacion(canales[i % canales.length])
                            .wizardCompletado(i % 3 != 0).build());
                }
            });
        }
        System.out.println("✓ Perfil preferencias cargado");
    }

    // ── Pollas ─────────────────────────────────────────────────────────────────

    @Transactional
    public void seedPollas() {
        if (pollaRepository.count() > 0) return;

        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        List<Usuario> aficionados = new ArrayList<>();
        for (String[] af : AFICIONADO_DATA) {
            usuarioRepository.findByEmail(af[0]).ifPresent(aficionados::add);
        }
        if (master == null || aficionados.isEmpty()) return;

        String[][] pollasData = {
            {"Copa América Simulacro",  "COPA26"},
            {"Grupo C Mundial 2026",    "GRUP26C"},
            {"Predicción Final 2026",   "FINAL26"},
        };

        long apiPartidoBase = 401000L;
        for (int pi = 0; pi < pollasData.length; pi++) {
            Polla polla = pollaRepository.save(Polla.builder()
                    .nombre(pollasData[pi][0])
                    .codigoAcceso(pollasData[pi][1])
                    .pozoPuntos((pi + 1) * 150)
                    .creador(master).build());

            // Master siempre participa
            participantePollaRepository.save(ParticipantePolla.builder()
                    .usuario(master).polla(polla)
                    .puntosAcumulados(75 + pi * 25).build());

            // Predicción del master para cada polla
            prediccionRepository.save(Prediccion.builder()
                    .usuario(master).polla(polla)
                    .apiPartidoId(apiPartidoBase + pi)
                    .golesLocal(2).golesVisitante(1)
                    .puntosObtenidos(pi == 0 ? 3 : (pi == 1 ? 1 : 0)).build());

            // Hasta 5 aficionados adicionales por polla
            for (int ai = 0; ai < Math.min(5, aficionados.size()); ai++) {
                Usuario af = aficionados.get((pi * 5 + ai) % aficionados.size());
                if (!af.getId().equals(master.getId())) {
                    participantePollaRepository.save(ParticipantePolla.builder()
                            .usuario(af).polla(polla)
                            .puntosAcumulados(new Random().nextInt(60)).build());
                    prediccionRepository.save(Prediccion.builder()
                            .usuario(af).polla(polla)
                            .apiPartidoId(apiPartidoBase + pi)
                            .golesLocal(ai % 3).golesVisitante(ai % 2)
                            .puntosObtenidos(0).build());
                }
            }
        }
        System.out.println("✓ Pollas, participantes y predicciones cargados");
    }

    // ── Entradas ───────────────────────────────────────────────────────────────

    @Transactional
    public void seedEntradas() {
        if (entradaRepository.count() > 0) return;
        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        List<Usuario> aficionados = new ArrayList<>();
        for (String[] af : AFICIONADO_DATA) {
            usuarioRepository.findByEmail(af[0]).ifPresent(aficionados::add);
        }

        String[][] entradasData = {
            // {categoria, precio, estado, selLocal, selVisitante, estadio, ronda}
            {"VIP",     "450.00", "VENDIDA", "Argentina",      "México",         "MetLife Stadium",      "Grupo A"},
            {"GENERAL", "120.00", "VENDIDA", "Colombia",       "Brasil",         "SoFi Stadium",         "Grupo B"},
            {"PREMIUM", "280.00", "DISPONIBLE", "Francia",     "España",         "AT&T Stadium",         "Grupo C"},
            {"VIP",     "500.00", "DISPONIBLE", "Alemania",    "Portugal",       "Estadio Azteca",       "Grupo D"},
            {"GENERAL", "150.00", "USADA",   "Estados Unidos", "Canadá",         "Levi's Stadium",       "Grupo E"},
            {"PREMIUM", "320.00", "VENDIDA", "Uruguay",        "Colombia",       "Q2 Stadium",           "Grupo F"},
            {"VIP",     "600.00", "DISPONIBLE", "Argentina",   "Brasil",         "MetLife Stadium",      "Semifinal"},
            {"GENERAL", "200.00", "VENDIDA", "Francia",        "Alemania",       "Rose Bowl",            "Cuartos de Final"},
            {"PREMIUM", "380.00", "DISPONIBLE", "Portugal",   "España",         "Hard Rock Stadium",    "Semifinal"},
            {"VIP",     "800.00", "DISPONIBLE", "Argentina",   "Francia",        "MetLife Stadium",      "Final"},
            {"GENERAL", "100.00", "DISPONIBLE", "Japón",       "Marruecos",      "BC Place",             "Grupo G"},
            {"PREMIUM", "250.00", "VENDIDA", "Países Bajos",   "Italia",         "Gillette Stadium",     "Grupo H"},
            {"VIP",     "350.00", "USADA",   "Inglaterra",     "Argentina",      "AT&T Stadium",         "Cuartos de Final"},
            {"GENERAL", "130.00", "DISPONIBLE", "México",      "Uruguay",        "Estadio AKRON",        "Grupo C"},
            {"PREMIUM", "300.00", "VENDIDA", "Brasil",         "Portugal",       "NRG Stadium",          "Octavos de Final"},
        };

        String[] stripeIds = {"pi_3OkVzXLkdIwH","pi_4MnWaYMleJxI","pi_5NpXbZNmfKyJ","pi_6OqYcAOnhLzK",null,
                              "pi_7PrZdBPoiMAL","pi_8QsAeCQpjNBM",null,null,"pi_9RtBfDRqkOCN",
                              null,"pi_0SuCgESrlPDO","pi_1TvDhFTsmQEP",null,"pi_2UwEiGUnrRFQ"};

        LocalDateTime baseDate = LocalDateTime.now().minusDays(60);

        for (int i = 0; i < entradasData.length; i++) {
            String[] e = entradasData[i];
            boolean esMaster = i < 2;
            Usuario comprador = esMaster ? master :
                    (aficionados.isEmpty() ? null : aficionados.get(i % aficionados.size()));
            if (comprador == null) continue;

            boolean vendida = "VENDIDA".equals(e[2]) || "USADA".equals(e[2]);
            entradaRepository.save(Entrada.builder()
                    .codigoQr("QR-WC2026-" + String.format("%04d", i + 1))
                    .categoria(e[0]).precio(new BigDecimal(e[1])).estado(e[2])
                    .total(new BigDecimal(e[1]))
                    .stripePaymentIntentId(stripeIds[i])
                    .stripeStatus(stripeIds[i] != null ? (vendida ? "succeeded" : "requires_payment_method") : null)
                    .fechaCompra(vendida ? baseDate.plusDays(i * 3) : null)
                    .emailComprador(vendida ? comprador.getEmail() : null)
                    .apiPartidoId(401000L + i)
                    .seleccionLocal(e[3]).seleccionVisitante(e[4])
                    .estadioNombre(e[5]).ronda(e[6])
                    .usuarioComprador(vendida ? comprador : null)
                    .build());
        }
        System.out.println("✓ Entradas cargadas (15 total)");
    }

    // ── Agenda items ───────────────────────────────────────────────────────────

    @Transactional
    public void seedAgendaItems() {
        if (agendaItemRepository.count() > 0) return;
        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        if (master == null) return;

        LocalDateTime base = LocalDateTime.of(2026, 6, 11, 15, 0);
        Object[][] items = {
            {"Partido Colombia vs Brasil",        "No perder este partidazo!", "PARTIDO",     "ALTA",  base,                 base.plusHours(2),  401001L, "MetLife Stadium"},
            {"Vuelo a Nueva York",                "Salida desde BOG 06:00",   "VIAJE",       "ALTA",  base.minusDays(2),    base.minusDays(2).plusHours(10), null, "Aeropuerto JFK"},
            {"Entrada Final Copa América",        "Revisar QR antes de salir","ENTRADA",     "ALTA",  base.plusDays(15),    base.plusDays(15).plusHours(3),   401015L,"MetLife Stadium"},
            {"Revisar predicciones Grupo C",      "Actualizar antes del martes","CUSTOM",    "MEDIA", base.plusDays(3),     base.plusDays(3).plusHours(1),   null, null},
            {"Cena con aficionados colombianos",  "Restaurante en Brooklyn",  "CUSTOM",      "BAJA",  base.plusDays(1),     base.plusDays(1).plusHours(3),   null, "Brooklyn, NY"},
        };

        for (Object[] item : items) {
            agendaItemRepository.save(AgendaItem.builder()
                    .usuario(master).titulo((String)item[0]).descripcion((String)item[1])
                    .tipo((String)item[2]).prioridad((String)item[3])
                    .fechaInicio((LocalDateTime)item[4]).fechaFin((LocalDateTime)item[5])
                    .apiPartidoId((Long)item[6]).ubicacion((String)item[7]).build());
        }
        System.out.println("✓ Agenda items cargados");
    }

    // ── Recordatorios viaje ────────────────────────────────────────────────────

    @Transactional
    public void seedRecordatoriosViaje() {
        if (recordatorioViajeRepository.count() > 0) return;
        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        if (master == null) return;

        Object[][] viajes = {
            {"Nueva York",  "Estados Unidos", "America/New_York",   LocalDate.of(2026,6,9),  LocalDate.of(2026,6,16), "MetLife Stadium",    "Hotel en Manhattan. Match day 1 Colombia."},
            {"Toronto",     "Canadá",         "America/Toronto",    LocalDate.of(2026,6,22), LocalDate.of(2026,6,27), "BMO Field",          "Posible vuelo WestJet. Ver partido Canadá."},
            {"Dallas",      "Estados Unidos", "America/Chicago",    LocalDate.of(2026,7,2),  LocalDate.of(2026,7,6),  "AT&T Stadium",       "Cuartos de final si Colombia clasifica."},
        };

        for (Object[] v : viajes) {
            recordatorioViajeRepository.save(RecordatorioViaje.builder()
                    .usuario(master).ciudadDestino((String)v[0]).paisDestino((String)v[1])
                    .zonaHorariaDestino((String)v[2])
                    .fechaInicio((LocalDate)v[3]).fechaFin((LocalDate)v[4])
                    .estadioDestino((String)v[5]).notas((String)v[6]).build());
        }
        System.out.println("✓ Recordatorios de viaje cargados");
    }

    // ── Logs transaccionales ───────────────────────────────────────────────────

    @Transactional
    public void seedLogsTransaccionales() {
        if (logsTransaccionalRepository.count() > 0) return;

        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        List<Usuario> aficionados = new ArrayList<>();
        for (String[] af : AFICIONADO_DATA) {
            usuarioRepository.findByEmail(af[0]).ifPresent(aficionados::add);
        }
        if (master == null) return;

        String correlId = UUID.randomUUID().toString().substring(0, 16);
        LocalDateTime base = LocalDateTime.now().minusDays(45);

        String[][] logsMaster = {
            {"LOGIN",             "BAJA",  "Inicio de sesión exitoso desde IP 181.55.32.10"},
            {"COMPRA_ENTRADA",    "MEDIA", "Entrada VIP comprada: QR-WC2026-0001, Stripe pi_3OkVzXLkdIwH"},
            {"APERTURA_PAQUETE",  "BAJA",  "Paquete abierto: 5 láminas obtenidas (rareza COMUN x3, RARO x2)"},
            {"PREDICCION",        "BAJA",  "Predicción registrada: Argentina 2-1 México, polla COPA26"},
            {"APERTURA_PAQUETE",  "BAJA",  "Paquete abierto: 5 láminas (EPICO x1, COMUN x4)"},
            {"INTERCAMBIO_LAMINA","MEDIA", "Solicitud de intercambio enviada (lámina #45 por #112)"},
            {"LOGIN",             "BAJA",  "Inicio de sesión desde dispositivo móvil iOS"},
            {"COMPRA_ENTRADA",    "MEDIA", "Entrada GENERAL comprada: QR-WC2026-0002, Colombia vs Brasil"},
            {"APERTURA_PAQUETE",  "BAJA",  "Paquete abierto: Lionel Messi LEGENDARIO obtenido!"},
            {"PREDICCION",        "BAJA",  "Predicción: Colombia 3-0 Brasil, polla GRUP26C"},
            {"PERFIL_ACTUALIZADO","BAJA",  "Preferencias actualizadas: idioma=es, canales=APP,EMAIL,PUSH"},
            {"LOGIN",             "BAJA",  "Inicio de sesión exitoso"},
            {"APERTURA_PAQUETE",  "BAJA",  "Paquete abierto: 5 láminas (RARO x2, COMUN x3)"},
            {"PREDICCION",        "BAJA",  "Predicción: Argentina 1-1 Francia, polla FINAL26"},
            {"LOGIN",             "BAJA",  "Inicio de sesión desde nueva IP"},
            {"COMPRA_ENTRADA",    "ALTA",  "Intento de compra fallido: tarjeta rechazada"},
            {"APERTURA_PAQUETE",  "BAJA",  "12° paquete abierto: 5 láminas COMUN"},
            {"LOGIN",             "BAJA",  "Inicio de sesión exitoso — sesión normal"},
            {"PREDICCION",        "BAJA",  "Predicción: Uruguay 0-2 Colombia"},
            {"LOGIN",             "BAJA",  "Inicio de sesión desde dispositivo nuevo"},
        };

        for (int i = 0; i < logsMaster.length; i++) {
            String[] l = logsMaster[i];
            String hash = Integer.toHexString((l[0] + l[2] + i).hashCode());
            logsTransaccionalRepository.save(LogsTransaccional.builder()
                    .accion(l[0]).nivelRiesgo(l[1]).detalle(l[2])
                    .hashIntegridad("md5_" + hash)
                    .correlationId(correlId)
                    .timestamp(base.plusDays(i).plusHours(i % 12))
                    .verificadoCompliance(i % 4 == 0)
                    .usuario(master).build());
        }

        // Logs para 10 aficionados seed
        String[] acciones = {"LOGIN","APERTURA_PAQUETE","PREDICCION","COMPRA_ENTRADA","LOGIN","APERTURA_PAQUETE"};
        String[] niveles   = {"BAJA","BAJA","BAJA","MEDIA","BAJA","BAJA"};
        for (int i = 0; i < Math.min(10, aficionados.size()); i++) {
            Usuario af = aficionados.get(i);
            for (int j = 0; j < 3; j++) {
                String acc = acciones[(i + j) % acciones.length];
                logsTransaccionalRepository.save(LogsTransaccional.builder()
                        .accion(acc).nivelRiesgo(niveles[(i + j) % niveles.length])
                        .detalle("Acción " + acc + " registrada para usuario " + af.getNombre())
                        .hashIntegridad("md5_" + Integer.toHexString((af.getEmail() + j).hashCode()))
                        .correlationId(UUID.randomUUID().toString().substring(0, 16))
                        .timestamp(base.plusDays(i * 2 + j))
                        .verificadoCompliance(false)
                        .usuario(af).build());
            }
        }
        System.out.println("✓ Logs transaccionales cargados");
    }

    // ── Reportes compliance ────────────────────────────────────────────────────

    @Transactional
    public void seedReportesCompliance() {
        if (reporteComplianceRepository.count() > 0) return;
        Usuario superAdmin = usuarioRepository.findByEmail("superadmin@mundial2026.com").orElse(null);
        Usuario comp1      = usuarioRepository.findByEmail("compliance1@mundial26.com").orElse(null);
        if (superAdmin == null && comp1 == null) return;

        Usuario gen = superAdmin != null ? superAdmin : comp1;

        Object[][] reportes = {
            {"AUDITORIA_ACCESOS",         "Reporte de accesos del mes de mayo 2026. Total: 3.247 logins, 12 intentos fallidos bloqueados.", "/reportes/auditoria_may2026.pdf"},
            {"REPORTE_TRANSACCIONES",     "Resumen transaccional Q2-2026: 1.204 compras completadas, 23 reembolsos, total $287.450 USD.", "/reportes/transacciones_q2_2026.pdf"},
            {"REPORTE_USUARIOS",          "Estado de usuarios activos: 847 aficionados, 15 operadores, 8 agentes soporte, 3 compliance.", "/reportes/usuarios_may2026.pdf"},
            {"INCIDENTES_CRITICOS",       "0 incidentes críticos en el período. 16 incidentes menores resueltos en < 24h.", "/reportes/incidentes_may2026.pdf"},
            {"CUMPLIMIENTO_GDPR",         "Verificación de cumplimiento GDPR/LGPD: todos los usuarios con consentimiento actualizado.", "/reportes/gdpr_may2026.pdf"},
        };

        for (Object[] r : reportes) {
            reporteComplianceRepository.save(ReporteCompliance.builder()
                    .tipoReporte((String)r[0]).descripcion((String)r[1])
                    .rutaArchivo((String)r[2]).generador(gen).build());
        }
        System.out.println("✓ Reportes de compliance cargados");
    }

    // ── Reportes interacción API ───────────────────────────────────────────────

    @Transactional
    public void seedReportesInteraccionAPI() {
        if (reporteInteraccionAPIRepository.count() > 0) return;
        List<AliadoComercial> aliados = aliadoComercialRepository.findAll();
        if (aliados.isEmpty()) return;

        LocalDate fechaCorte = LocalDate.of(2026, 5, 31);
        String[] endpoints = {
            "/api/v1/album/stats", "/api/v1/partidos/live", "/api/v1/entradas/disponibles",
            "/api/v1/pollas/ranking", "/api/v1/notificaciones/broadcast"
        };

        for (int i = 0; i < aliados.size(); i++) {
            AliadoComercial aliado = aliados.get(i);
            reporteInteraccionAPIRepository.save(ReporteInteraccionAPI.builder()
                    .aliado(aliado)
                    .endpoint(endpoints[i % endpoints.length])
                    .peticionesExitosas(500 + i * 120)
                    .peticionesFallidas(i * 3 + 2)
                    .fechaCorte(fechaCorte).build());
        }
        System.out.println("✓ Reportes interacción API cargados");
    }

    // ── Intercambios láminas ───────────────────────────────────────────────────

    @Transactional
    public void seedIntercambiosLaminas() {
        if (intercambioLaminaRepository.count() > 0) return;

        Usuario master = usuarioRepository.findByEmail("juamepi90@gmail.com").orElse(null);
        List<Usuario> aficionados = new ArrayList<>();
        for (String[] af : AFICIONADO_DATA) {
            usuarioRepository.findByEmail(af[0]).ifPresent(aficionados::add);
        }
        List<Lamina> laminas = laminaRepository.findAll();

        if (master == null || aficionados.isEmpty() || laminas.size() < 10) return;

        String[][] intercambios = {
            {"PENDIENTE",  null},
            {"ACEPTADO",   "2026-05-10T14:30:00"},
            {"RECHAZADO",  "2026-05-08T10:15:00"},
            {"PENDIENTE",  null},
            {"ACEPTADO",   "2026-05-15T09:00:00"},
        };

        for (int i = 0; i < intercambios.length; i++) {
            Usuario receptor = aficionados.get(i % aficionados.size());
            Lamina ofrecida   = laminas.get(i * 2);
            Lamina solicitada = laminas.get(i * 2 + 1);
            String estado = intercambios[i][0];
            LocalDateTime resolucion = intercambios[i][1] != null
                    ? LocalDateTime.parse(intercambios[i][1]) : null;

            intercambioLaminaRepository.save(IntercambioLamina.builder()
                    .solicitante(master).receptor(receptor)
                    .laminaOfrecida(ofrecida).laminaSolicitada(solicitada)
                    .estado(estado).fechaResolucion(resolucion).build());
        }
        System.out.println("✓ Intercambios de láminas cargados");
    }

    // ── Incidentes y notificaciones (existing, unchanged) ─────────────────────

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
        String[] estados     = {"ABIERTO", "EN_PROGRESO", "RESUELTO", "ABIERTO", "EN_PROGRESO"};

        for (int i = 0; i < descripciones.length; i++) {
            Usuario reportador = aficionados.get(i % aficionados.size());
            Usuario agente     = agentes.isEmpty() ? null : agentes.get(i % agentes.size());
            String estado      = estados[i % estados.length];
            boolean asignado   = !estado.equals("ABIERTO") && agente != null;
            incidenteSoporteRepository.save(IncidenteSoporte.builder()
                    .descripcion(descripciones[i])
                    .prioridad(prioridades[i % prioridades.length])
                    .estado(estado)
                    .reportador(reportador)
                    .agenteSoporte(asignado ? agente : null).build());
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
            notificacionRepository.save(Notificacion.builder()
                    .mensaje(mensajes[i % mensajes.length])
                    .canal(canales[i % canales.length])
                    .destinatario(aficionados.get(i))
                    .emisor(admin).build());
        }
        System.out.println("✓ Notificaciones cargadas");
    }
}
