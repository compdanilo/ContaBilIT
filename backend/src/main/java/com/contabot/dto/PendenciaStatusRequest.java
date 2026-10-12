package com.contabot.dto;

import com.contabot.model.Pendencia;
import jakarta.validation.constraints.NotNull;

public record PendenciaStatusRequest(
        @NotNull Pendencia.Status status
) {}
