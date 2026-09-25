package com.contabot.dto;

import com.contabot.model.Usuario;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
        @NotBlank String nome,
        @NotBlank String email,
        @NotBlank @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres") String senha,
        @NotNull Usuario.Papel papel,
        Long clienteId
) {}
