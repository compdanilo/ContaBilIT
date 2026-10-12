package com.contabot.dto;

import com.contabot.model.Lancamento;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoResponse(
        Long id,
        Long competenciaId,
        Lancamento.Tipo tipo,
        String descricao,
        BigDecimal valor,
        LocalDate vencimento,
        boolean pago
) {}
