package com.contabot.dto;

import java.util.List;

public record CompetenciaDetalheResponse(
        CompetenciaResponse competencia,
        List<DocumentoResponse> documentos,
        List<LancamentoResponse> lancamentos,
        List<PendenciaResponse> pendencias,
        RelatorioResponse relatorio
) {}
