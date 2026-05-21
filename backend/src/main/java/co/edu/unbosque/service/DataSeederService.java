package co.edu.unbosque.service;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private static final String[] SELECCIONES_FAVORITAS = {
        "Argentina", "Brasil", "Francia", "España", "Alemania",
        "Portugal", "Colombia", "Uruguay", "México", "Estados Unidos",
        "Canadá", "Inglaterra", "Italia", "Países Bajos", "Japón"
    };

    @Transactional
    public void seedDatabase() {
        seedRoles();
        seedAllUsuarios();
        seedAliadosComerciales(rolRepository.findByNombre("ALIADO").orElse(null));
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
        if (aliadoComercialRepository.count() > 0) return;
        if (rolAliado == null) return;

        String pass = passwordEncoder.encode("Aliado2026!");
        // {email, nombre empresa, tipo servicio, token}
        String[][] aliados = {
            {"adidas@mundial26.com",     "Adidas FIFA Partner",   "Equipamiento deportivo",         "tok_adidas_wc2026_x9k2"},
            {"cocacola@mundial26.com",   "Coca-Cola WC2026",      "Bebidas y patrocinio",           "tok_cocacola_wc2026_m3p7"},
            {"qatarairways@mundial26.com","Qatar Airways Official","Transporte aéreo",              "tok_qatar_wc2026_z1q5"},
            {"visa@mundial26.com",       "Visa Inc.",             "Pagos y servicios financieros",  "tok_visa_wc2026_r8t4"},
            {"hyundai@mundial26.com",    "Hyundai Motor",         "Movilidad oficial",              "tok_hyundai_wc2026_v6n9"},
        };

        for (String[] a : aliados) {
            Usuario usuario = usuarioRepository.findByEmail(a[0]).orElseGet(() ->
                usuarioRepository.save(Usuario.builder()
                        .email(a[0]).nombre(a[1]).passwordHash(pass).rol(rolAliado)
                        .zonaHoraria("America/Bogota")
                        .build()));

            aliadoComercialRepository.save(AliadoComercial.builder()
                    .usuario(usuario)
                    .nombre(a[1])
                    .tipoServicio(a[2])
                    .tokenAcceso(a[3])
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
}
