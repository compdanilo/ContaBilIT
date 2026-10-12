package com.contabot.service;

import com.contabot.dto.UsuarioRequest;
import com.contabot.dto.UsuarioResponse;
import com.contabot.model.Cliente;
import com.contabot.model.Usuario;
import com.contabot.repository.ClienteRepository;
import com.contabot.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, ClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public UsuarioResponse criar(UsuarioRequest request) {
        if (repository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new IllegalStateException("Já existe um usuário com este e-mail.");
        }
        Cliente cliente = null;
        if (request.papel() == Usuario.Papel.CLIENTE) {
            if (request.clienteId() == null) {
                throw new IllegalStateException("Um usuário do papel CLIENTE precisa estar vinculado a um cliente.");
            }
            cliente = clienteRepository.findById(request.clienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + request.clienteId()));
        }
        Usuario usuario = new Usuario(request.nome().trim(), request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.senha()), request.papel(), cliente);
        return toResponse(repository.save(usuario));
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Usuário não encontrado: " + id);
        }
        repository.deleteById(id);
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPapel(),
                u.getCliente() == null ? null : u.getCliente().getId(), u.isAtivo());
    }
}
