package com.contabot.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        long clientes,
        long competenciasAbertas,
        long competenciasAguardandoValidacao,
        long competenciasValidadas,
        long competenciasComPendencias,
        long totalDocumentos,
        long pendenciasAbertas,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo
) {}
