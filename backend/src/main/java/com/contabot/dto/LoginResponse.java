package com.contabot.dto;

import com.contabot.model.Usuario;

public record LoginResponse(String token, String nome, String email, Usuario.Papel papel, Long clienteId) {}
