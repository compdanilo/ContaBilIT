package com.contabot.dto;

import com.contabot.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        Usuario.Papel papel,
        Long clienteId,
        boolean ativo
) {}
