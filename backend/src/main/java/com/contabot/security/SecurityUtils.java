package com.contabot.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    public Long clienteIdRestrito() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetailsService.UsuarioPrincipal principal) {
            if ("CLIENTE".equals(principal.papel())) {
                return principal.clienteId();
            }
        }
        return null;
    }
}
