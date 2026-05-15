package co.edu.unbosque.service;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * DataSeederService: siembra datos mínimos de arranque (roles, usuarios de prueba).
 *
 * Selecciones, jugadores, estadios y partidos se obtienen en tiempo real
 * desde football-data.org — NO existen tablas locales para esos datos.
 */
@Service
@RequiredArgsConstructor
public class DataSeederService {

    private final RolRepository rolRepository;
    private final LaminaRepository laminaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void seedDatabase() {
        if (rolRepository.count() > 0) {
            System.out.println("Base de datos ya contiene datos. Seeding omitido.");
            return;
        }

        System.out.println("🌱 Iniciando seeding de base de datos...");
        seedRoles();
        seedUsuarios();
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

    private void seedUsuarios() {
        Rol adminRole      = rolRepository.findByNombre("ADMIN").orElse(null);
        Rol aficionadoRole = rolRepository.findByNombre("AFICIONADO").orElse(null);
        Rol operadorRole   = rolRepository.findByNombre("OPERADOR").orElse(null);

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
