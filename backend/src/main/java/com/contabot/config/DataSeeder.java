package com.contabot.config;

import com.contabot.model.Cliente;
import com.contabot.model.Usuario;
import com.contabot.repository.ClienteRepository;
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
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (clienteRepository.count() == 0) {
            Cliente devCli = new Cliente(
                    "Danilo Silva Software & Cloud Ltda",
                    "12345678000195",
                    "contato@danilosoftware.tech",
                    "11987654321",
                    Cliente.Tipo.PESSOA_JURIDICA
            );
            clienteRepository.save(devCli);

            Cliente devopsCli = new Cliente(
                    "ByteCraft DevOps & SRE Consultoria ME",
                    "98765432000110",
                    "contato@bytecraft.io",
                    "11912345678",
                    Cliente.Tipo.PESSOA_JURIDICA
            );
            clienteRepository.save(devopsCli);
        }

        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario("Administrador Tech", "admin@contabilit.com.br",
                    passwordEncoder.encode("admin123"), Usuario.Papel.ADMIN, null);
            usuarioRepository.save(admin);

            Usuario contador = new Usuario("Carlos Contador (Especialista TI)", "contador@contabilit.com.br",
                    passwordEncoder.encode("contador123"), Usuario.Papel.CONTADOR, null);
            usuarioRepository.save(contador);

            Cliente clientePrincipal = clienteRepository.findAll().stream().findFirst().orElse(null);
            Usuario devUser = new Usuario("Danilo Silva (Dev PJ)", "cliente@empresa.com.br",
                    passwordEncoder.encode("cliente123"), Usuario.Papel.CLIENTE, clientePrincipal);
            usuarioRepository.save(devUser);

            log.info("Usuários e clientes de TI criados com sucesso.");
        }
    }
}
