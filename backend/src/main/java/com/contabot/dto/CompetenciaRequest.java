package com.contabot.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CompetenciaRequest(
        @NotNull Long clienteId,
        @NotNull @Min(2000) @Max(2100) Integer ano,
        @NotNull @Min(1) @Max(12) Integer mes
) {}
