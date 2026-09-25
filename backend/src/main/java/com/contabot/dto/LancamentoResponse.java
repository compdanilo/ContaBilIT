package com.contabot.dto;

import com.contabot.model.Lancamento.Tipo;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoResponse(
        Long id,
        Long competenciaId,
        Tipo tipo,
        String descricao,
        BigDecimal valor,
        LocalDate vencimento,
        boolean pago
) {}
