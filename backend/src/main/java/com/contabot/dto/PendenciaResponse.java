package com.contabot.dto;

import com.contabot.model.Pendencia;
import java.time.LocalDateTime;

public record PendenciaResponse(
        Long id,
        Long competenciaId,
        Long documentoId,
        Pendencia.Tipo tipo,
        String descricao,
        Pendencia.Status status,
        LocalDateTime criadaEm,
        LocalDateTime resolvidaEm
) {}
