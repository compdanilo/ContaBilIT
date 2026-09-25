package com.contabot.dto;

import com.contabot.model.Cliente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClienteRequest(
        @NotBlank String nome,
        String cpfCnpj,
        String email,
        String telefone,
        @NotNull Cliente.Tipo tipo,
        boolean ativo
) {}
