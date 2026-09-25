package com.contabot.dto;

import com.contabot.model.Documento;
import jakarta.validation.constraints.NotNull;

/** Usado pelo contador/analista para validar, rejeitar ou anotar um documento. */
public record DocumentoAtualizacaoRequest(
        @NotNull Documento.Status status,
        String observacao
) {}
