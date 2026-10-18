package co.edu.unbosque.security;

import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Traduce el usuario autenticado (email del JWT) a su id en base de datos.
 * Los controladores lo usan en lugar de recibir el id del usuario por la URL,
 * así nadie puede operar sobre los datos de otra cuenta.
 */
@Component
@RequiredArgsConstructor
public class UsuarioActual {

    private final UsuarioRepository usuarioRepository;

    public Integer id(UserDetails userDetails) {
        if (userDetails == null || userDetails.getUsername() == null) {
            throw new ResourceNotFoundException("No hay sesión activa");
        }
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .map(Usuario::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}
