package com.contabot.dto;

import com.contabot.model.Documento;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DocumentoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        Long competenciaId,
        String nomeArquivo,
        Documento.Tipo tipo,
        Documento.Status status,
        LocalDate dataDocumento,
        BigDecimal valor,
        String identificador,
        LocalDateTime enviadoEm,
        String observacao
) {}
