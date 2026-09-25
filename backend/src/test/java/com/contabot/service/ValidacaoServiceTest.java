package com.contabot.service;

import com.contabot.model.Cliente;
import com.contabot.model.Competencia;
import com.contabot.model.Documento;
import com.contabot.repository.DocumentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ValidacaoServiceTest {

    @Mock
    private DocumentoRepository documentoRepository;

    private ValidacaoService service;
    private Cliente cliente;
    private Competencia competencia;

    @BeforeEach
    void setUp() throws Exception {
        service = new ValidacaoService(documentoRepository);
        cliente = new Cliente("Cliente Teste", "12345678900", "a@a.com", "62999999999", Cliente.Tipo.PESSOA_FISICA);
        setId(cliente, 1L);
        competencia = new Competencia(cliente, 2026, 9);
        setId(competencia, 10L);
    }

    private Documento novoDocumento(Long id) throws Exception {
        Documento documento = new Documento(cliente, competencia, "nota.pdf", Documento.Tipo.DOCUMENTO_FISCAL, LocalDateTime.now());
        setId(documento, id);
        return documento;
    }

    private void setId(Object entidade, Long id) throws Exception {
        Field campo = entidade.getClass().getDeclaredField("id");
        campo.setAccessible(true);
        campo.set(entidade, id);
    }

    @Test
    void documento_completo_e_unico_deve_ser_valido() throws Exception {
        Documento documento = novoDocumento(1L);
        documento.setDataDocumento(LocalDate.now());
        documento.setValor(BigDecimal.TEN);
        documento.setIdentificador("NF-001");
        when(documentoRepository.findByCompetenciaId(anyLong())).thenReturn(List.of(documento));

        var resultado = service.validar(documento);

        assertEquals(ValidacaoService.Resultado.VALIDO, resultado.resultado());
    }

    @Test
    void documento_sem_valor_deve_ficar_pendente() throws Exception {
        Documento documento = novoDocumento(1L);
        documento.setDataDocumento(LocalDate.now());
        documento.setIdentificador("NF-002");
        when(documentoRepository.findByCompetenciaId(anyLong())).thenReturn(List.of(documento));

        var resultado = service.validar(documento);

        assertEquals(ValidacaoService.Resultado.PENDENTE, resultado.resultado());
    }

    @Test
    void documento_com_identificador_duplicado_deve_ser_inconsistente() throws Exception {
        Documento existente = novoDocumento(1L);
        existente.setIdentificador("NF-003");
        existente.setDataDocumento(LocalDate.now());
        existente.setValor(BigDecimal.TEN);

        Documento novo = novoDocumento(2L);
        novo.setIdentificador("NF-003");
        novo.setDataDocumento(LocalDate.now());
        novo.setValor(BigDecimal.TEN);

        when(documentoRepository.findByCompetenciaId(anyLong())).thenReturn(List.of(existente, novo));

        var resultado = service.validar(novo);

        assertEquals(ValidacaoService.Resultado.INCONSISTENTE, resultado.resultado());
    }
}
