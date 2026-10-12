package com.contabot.dto;

import com.contabot.model.Pendencia.Tipo;
import jakarta.validation.constraints.NotBlank;

public record RelatorioDevolverRequest(
        @NotBlank String observacoes,
        boolean criarPendencia,
        Tipo tipoPendencia,
        String descricaoPendencia
) {}
