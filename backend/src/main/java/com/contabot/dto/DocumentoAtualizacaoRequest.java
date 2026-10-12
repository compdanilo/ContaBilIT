package com.contabot.dto;

import com.contabot.model.Documento;
import jakarta.validation.constraints.NotNull;

public record DocumentoAtualizacaoRequest(
        @NotNull Documento.Status status,
        String observacao
) {}
