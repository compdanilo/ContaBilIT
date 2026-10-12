package com.contabot.dto;

import com.contabot.model.Relatorio;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RelatorioResponse(
        Long id,
        Long competenciaId,
        LocalDateTime geradoEm,
        Relatorio.Status status,
        String observacoes,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo,
        long totalDocumentos,
        long documentosValidados,
        long totalPendencias,
        long pendenciasAbertas
) {}
