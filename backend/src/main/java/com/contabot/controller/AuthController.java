package com.contabot.controller;

import com.contabot.dto.LoginRequest;
import com.contabot.dto.LoginResponse;
import com.contabot.model.Usuario;
import com.contabot.repository.UsuarioRepository;
import com.contabot.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.senha()));

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalStateException("Usuário não encontrado."));

        String token = jwtService.gerarToken(usuario.getEmail(), Map.of("papel", usuario.getPapel().name()));
        Long clienteId = usuario.getCliente() == null ? null : usuario.getCliente().getId();
        return new LoginResponse(token, usuario.getNome(), usuario.getEmail(), usuario.getPapel(), clienteId);
    }
}
