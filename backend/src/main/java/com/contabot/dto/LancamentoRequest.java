package com.contabot.dto;

import com.contabot.model.Lancamento.Tipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoRequest(
        @NotNull Long competenciaId,
        @NotNull Tipo tipo,
        @NotBlank String descricao,
        @NotNull @Positive BigDecimal valor,
        @NotNull LocalDate vencimento,
        boolean pago
) {}
