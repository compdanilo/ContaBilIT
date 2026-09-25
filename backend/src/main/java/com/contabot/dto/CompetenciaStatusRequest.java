package com.contabot.dto;

import com.contabot.model.Competencia.Status;
import jakarta.validation.constraints.NotNull;

public record CompetenciaStatusRequest(@NotNull Status status) {}
