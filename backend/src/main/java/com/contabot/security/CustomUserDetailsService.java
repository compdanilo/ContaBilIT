package com.contabot.security;

import com.contabot.model.Usuario;
import com.contabot.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repository;

    public CustomUserDetailsService(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = repository.findByEmailIgnoreCase(email)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado ou inativo: " + email));
        return User.withUsername(usuario.getEmail())
                .password(usuario.getSenhaHash())
                .authorities(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name()))
                .build();
    }
}
