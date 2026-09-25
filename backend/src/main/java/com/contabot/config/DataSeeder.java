package com.contabot.config;

import com.contabot.model.Usuario;
import com.contabot.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario("Administrador", "admin@contabilit.com.br",
                    passwordEncoder.encode("admin123"), Usuario.Papel.ADMIN, null);
            usuarioRepository.save(admin);
            log.info("Nenhum usuário encontrado — criado administrador padrão: " +
                    "admin@contabilit.com.br / admin123 (troque a senha em produção).");
        }
    }
}
