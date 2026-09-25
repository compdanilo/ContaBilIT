package com.contabot.dto;

import java.util.List;

/** Visão completa da competência: dados + tudo que pertence a ela. */
public record CompetenciaDetalheResponse(
        CompetenciaResponse competencia,
        List<DocumentoResponse> documentos,
        List<LancamentoResponse> lancamentos,
        List<PendenciaResponse> pendencias,
        RelatorioResponse relatorio
) {}
