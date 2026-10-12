package com.contabot.dto;

import com.contabot.model.Lancamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoRequest(
        @NotNull Long competenciaId,
        @NotNull Lancamento.Tipo tipo,
        @NotBlank String descricao,
        @NotNull BigDecimal valor,
        @NotNull LocalDate vencimento,
        boolean pago
) {}
