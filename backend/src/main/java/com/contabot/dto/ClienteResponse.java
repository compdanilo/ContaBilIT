package com.contabot.dto;

import com.contabot.model.Cliente;
import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nome,
        String cpfCnpj,
        String email,
        String telefone,
        Cliente.Tipo tipo,
        boolean ativo,
        LocalDateTime criadoEm
) {}
