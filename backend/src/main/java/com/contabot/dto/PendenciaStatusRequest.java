package com.contabot.dto;

import com.contabot.model.Pendencia.Status;
import jakarta.validation.constraints.NotNull;

public record PendenciaStatusRequest(@NotNull Status status) {}
