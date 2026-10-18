package co.edu.unbosque.security;

import co.edu.unbosque.entity.Usuario;
import co.edu.unbosque.exception.ResourceNotFoundException;
import co.edu.unbosque.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UsuarioActualTest {

    private final UsuarioRepository repository = mock(UsuarioRepository.class);
    private final UsuarioActual usuarioActual = new UsuarioActual(repository);

    private static UserDetails sesion(String email) {
        return new User(email, "x", List.of());
    }

    @Test
    void resuelveElIdDelUsuarioDelToken() {
        Usuario laura = new Usuario();
        laura.setId(83);
        when(repository.findByEmail("laura@demo.com")).thenReturn(Optional.of(laura));

        assertThat(usuarioActual.id(sesion("laura@demo.com"))).isEqualTo(83);
    }

    @Test
    void fallaSinSesion() {
        assertThatThrownBy(() -> usuarioActual.id(null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void fallaSiElUsuarioDelTokenYaNoExiste() {
        when(repository.findByEmail("borrado@demo.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioActual.id(sesion("borrado@demo.com")))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
