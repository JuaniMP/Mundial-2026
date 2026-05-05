package co.edu.unbosque.service;

import co.edu.unbosque.dto.*;
import co.edu.unbosque.entity.Rol;
import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.BadRequestException;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.RolRepository;
import co.edu.unbosque.repository.UsuarioRepository;
import co.edu.unbosque.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;

    private final Map<String, ResetCodeData> resetCodes = new ConcurrentHashMap<>();

    private static class ResetCodeData {
        String code;
        long expiresAt;

        ResetCodeData(String code, long expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("El email ya está registrado");
        }

        Rol rol = rolRepository.findByNombre("AFICIONADO")
                .orElseThrow(() -> new ResourceNotFoundException("Rol AFICIONADO no encontrado"));

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .rol(rol)
                .zonaHoraria("UTC")
                .seleccionFavorita(request.getSeleccionFavorita())
                .build();

        usuario = usuarioRepository.save(usuario);

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol().getNombre())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String rolNombre = usuarioRepository.findRoleNameByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        usuario.setUltimoLogin(LocalDateTime.now());
        usuarioRepository.save(usuario);

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", rolNombre);
        extraClaims.put("userId", usuario.getId());

        String token = jwtUtil.generateToken(userDetails, extraClaims);

        return AuthResponse.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(rolNombre)
                .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));

        String resetCode = generateResetCode();
        long expiresAt = System.currentTimeMillis() + (15 * 60 * 1000); // 15 minutes

        resetCodes.put(email, new ResetCodeData(resetCode, expiresAt));

        log.info("🔐 Reset code generated for {}: {} (Expires in 15 minutes)", email, resetCode);
        try {
            emailService.sendPasswordResetEmail(email, resetCode);
            log.info("📧 Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("⚠️ Failed to send reset email to {}: {}", email, e.getMessage());
            throw new BadRequestException("Error al enviar el correo. Verifica la dirección e inténtalo de nuevo.");
        }
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        ResetCodeData resetCodeData = resetCodes.get(request.getEmail());
        if (resetCodeData == null) {
            throw new BadRequestException("No se encontró solicitud de reset para este email");
        }

        if (resetCodeData.isExpired()) {
            resetCodes.remove(request.getEmail());
            throw new BadRequestException("El código de reset ha expirado. Solicita uno nuevo");
        }

        if (!resetCodeData.code.equals(request.getCode())) {
            throw new BadRequestException("Código de reset inválido");
        }

        usuario.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        usuarioRepository.save(usuario);
        resetCodes.remove(request.getEmail());

        log.info("✅ Password reset successfully for: {}", request.getEmail());

        String rolNombre = usuarioRepository.findRoleNameByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getEmail());

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", rolNombre);
        extraClaims.put("userId", usuario.getId());

        String token = jwtUtil.generateToken(userDetails, extraClaims);

        return AuthResponse.builder()
                .token(token)
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(rolNombre)
                .build();
    }

    private String generateResetCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }
}
