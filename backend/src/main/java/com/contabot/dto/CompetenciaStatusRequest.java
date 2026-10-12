package com.contabot.dto;

import com.contabot.model.Competencia;
import jakarta.validation.constraints.NotNull;

public record CompetenciaStatusRequest(
        @NotNull Competencia.Status status
) {}
