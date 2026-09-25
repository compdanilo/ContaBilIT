package com.contabot.security;

import com.contabot.model.Usuario;
import com.contabot.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/** Ponto único para descobrir quem está logado e aplicar o escopo de dados por cliente. */
@Component
public class SecurityUtils {

    private final UsuarioRepository usuarioRepository;

    public SecurityUtils(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails userDetails)) {
            throw new IllegalStateException("Nenhum usuário autenticado.");
        }
        return usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuário autenticado não encontrado: " + userDetails.getUsername()));
    }

    /** Papel CLIENTE: devolve o id do cliente ao qual o login pertence. ADMIN/CONTADOR: devolve null (sem restrição). */
    public Long clienteIdRestrito() {
        Usuario usuario = usuarioAtual();
        return usuario.getPapel() == Usuario.Papel.CLIENTE && usuario.getCliente() != null
                ? usuario.getCliente().getId() : null;
    }
}
