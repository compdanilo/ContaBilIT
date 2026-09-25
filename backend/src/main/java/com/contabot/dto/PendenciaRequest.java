package com.contabot.dto;

import com.contabot.model.Pendencia.Tipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PendenciaRequest(
        @NotNull Long competenciaId,
        Long documentoId,
        @NotNull Tipo tipo,
        @NotBlank String descricao
) {}
