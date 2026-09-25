package com.contabot.dto;

import com.contabot.model.Competencia;
import java.time.LocalDateTime;

public record CompetenciaResponse(
        Long id,
        ClienteResponse cliente,
        int ano,
        int mes,
        Competencia.Status status,
        LocalDateTime criadaEm,
        LocalDateTime fechadaEm,
        long totalDocumentos,
        long documentosValidados,
        long totalPendencias,
        long pendenciasAbertas
) {}
