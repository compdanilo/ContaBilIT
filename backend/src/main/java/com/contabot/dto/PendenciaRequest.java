package com.contabot.dto;

import com.contabot.model.Pendencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PendenciaRequest(
        @NotNull Long competenciaId,
        Long documentoId,
        @NotNull Pendencia.Tipo tipo,
        @NotBlank String descricao
) {}
