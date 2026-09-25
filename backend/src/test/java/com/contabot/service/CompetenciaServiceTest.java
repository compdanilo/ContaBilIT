package com.contabot.service;

import com.contabot.dto.CompetenciaRequest;
import com.contabot.model.Cliente;
import com.contabot.model.Competencia;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.repository.PendenciaRepository;
import com.contabot.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompetenciaServiceTest {

    @Mock private CompetenciaRepository competenciaRepository;
    @Mock private DocumentoRepository documentoRepository;
    @Mock private PendenciaRepository pendenciaRepository;
    @Mock private ClienteService clienteService;
    @Mock private LancamentoService lancamentoService;
    @Mock private RelatorioService relatorioService;
    @Mock private SecurityUtils securityUtils;

    private CompetenciaService service;
    private Cliente cliente;

    @BeforeEach
    void setUp() throws Exception {
        service = new CompetenciaService(competenciaRepository, documentoRepository, pendenciaRepository,
                clienteService, lancamentoService, relatorioService, securityUtils);
        cliente = new Cliente("Cliente Teste", "12345678900", "a@a.com", "62999999999", Cliente.Tipo.PESSOA_FISICA);
        Field campo = Cliente.class.getDeclaredField("id");
        campo.setAccessible(true);
        campo.set(cliente, 1L);
        // Simula um login ADMIN/CONTADOR (sem restrição por cliente) — só relevante para os
        // testes que efetivamente chamam securityUtils; "lenient" evita falha em quem não chama.
        lenient().when(securityUtils.clienteIdRestrito()).thenReturn(null);
    }

    @Test
    void nao_deve_permitir_duas_competencias_iguais_para_o_mesmo_cliente() {
        when(clienteService.buscarEntidade(1L)).thenReturn(cliente);
        when(competenciaRepository.findByClienteIdAndAnoAndMes(1L, 2026, 9))
                .thenReturn(Optional.of(new Competencia(cliente, 2026, 9)));

        CompetenciaRequest request = new CompetenciaRequest(1L, 2026, 9);

        assertThrows(IllegalStateException.class, () -> service.criar(request));
    }
}
