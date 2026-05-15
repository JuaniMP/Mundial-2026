package co.edu.unbosque.config;

import co.edu.unbosque.entity.*;
import co.edu.unbosque.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * DataSeeder: gestiona los datos de bootstrap que el sistema necesita
 * para funcionar (roles, usuario admin).
 *
 * Selecciones, jugadores, estadios y partidos se obtienen en tiempo real
 * desde football-data.org a través de FootballDataService.
 * NO existen tablas locales para esos datos.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final AficionadoRepository aficionadoRepository;
    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedAdminUser();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Roles del sistema
    // ─────────────────────────────────────────────────────────────────────────

    private void seedRoles() {
        String[] roles = {"ADMIN", "AFICIONADO", "OPERADOR", "SOPORTE", "COMPLIANCE", "ALIADO"};
        Set<String> existentes = rolRepository.findAll().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toSet());
        for (String nombre : roles) {
            if (!existentes.contains(nombre)) {
                rolRepository.save(Rol.builder().nombre(nombre).build());
                log.info("Rol creado: {}", nombre);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Usuario admin inicial
    // ─────────────────────────────────────────────────────────────────────────

    private void seedAdminUser() {
        if (!usuarioRepository.existsByEmail("admin@mundial2026.com")) {
            Rol adminRol = rolRepository.findByNombre("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Rol ADMIN no encontrado"));
            Usuario admin = usuarioRepository.save(Usuario.builder()
                    .nombre("Administrador")
                    .email("admin@mundial2026.com")
                    .passwordHash(passwordEncoder.encode("Admin2026!"))
                    .rol(adminRol)
                    .zonaHoraria("America/Bogota")
                    .build());
            administradorRepository.save(Administrador.builder()
                    .usuario(admin)
                    .superadmin(true)
                    .departamento("Sistemas")
                    .requiereMfa(false)
                    .build());
            log.info("✅ Admin creado: admin@mundial2026.com / Admin2026!");
        } else {
            // Reparar: si existe el usuario pero no el registro en administradores
            usuarioRepository.findByEmail("admin@mundial2026.com").ifPresent(u -> {
                if (!administradorRepository.existsById(u.getId())) {
                    administradorRepository.save(Administrador.builder()
                            .usuario(u).superadmin(true)
                            .departamento("Sistemas").requiereMfa(false)
                            .build());
                    log.info("✅ Registro administradores reparado para admin@mundial2026.com");
                }
            });
        }

        // Reparar usuarios de test si existen
        usuarioRepository.findByEmail("admin@test.com").ifPresent(u -> {
            if (!administradorRepository.existsById(u.getId())) {
                administradorRepository.save(Administrador.builder()
                        .usuario(u).superadmin(false)
                        .departamento("Test").requiereMfa(false)
                        .build());
            }
        });
        usuarioRepository.findByEmail("aficionado@test.com").ifPresent(u -> {
            if (!aficionadoRepository.existsById(u.getId())) {
                aficionadoRepository.save(Aficionado.builder()
                        .usuario(u).seleccionFavorita(u.getSeleccionFavorita())
                        .build());
            }
        });
    }
}
