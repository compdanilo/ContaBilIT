package com.contabot.service;

import com.contabot.dto.ClienteRequest;
import com.contabot.dto.ClienteResponse;
import com.contabot.model.Cliente;
import com.contabot.repository.ClienteRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final SecurityUtils securityUtils;

    public ClienteService(ClienteRepository repository, SecurityUtils securityUtils) {
        this.repository = repository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse meuCliente() {
        Long clienteId = securityUtils.clienteIdRestrito();
        if (clienteId == null) {
            throw new IllegalStateException("Este endpoint é exclusivo para logins do papel CLIENTE.");
        }
        return toResponse(buscarEntidade(clienteId));
    }

    @Transactional(readOnly = true)
    public Cliente buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + id));
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest request) {
        Cliente cliente = new Cliente(
                normalizar(request.nome()), somenteDigitos(request.cpfCnpj()),
                normalizar(request.email()), somenteDigitos(request.telefone()), request.tipo()
        );
        cliente.setAtivo(request.ativo());
        return toResponse(repository.save(cliente));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscarEntidade(id);
        cliente.setNome(normalizar(request.nome()));
        cliente.setCpfCnpj(somenteDigitos(request.cpfCnpj()));
        cliente.setEmail(normalizar(request.email()));
        cliente.setTelefone(somenteDigitos(request.telefone()));
        cliente.setTipo(request.tipo());
        cliente.setAtivo(request.ativo());
        return toResponse(repository.save(cliente));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private String normalizar(String valor) {
        return StringUtils.hasText(valor) ? valor.trim() : null;
    }

    private String somenteDigitos(String valor) {
        if (!StringUtils.hasText(valor)) return null;
        String digitos = valor.replaceAll("\\D", "");
        return digitos.isEmpty() ? null : digitos;
    }

    public ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNome(), c.getCpfCnpj(), c.getEmail(), c.getTelefone(),
                c.getTipo(), c.isAtivo(), c.getCriadoEm());
    }
}
