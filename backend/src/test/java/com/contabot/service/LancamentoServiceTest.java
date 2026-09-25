package com.contabot.service;

import com.contabot.dto.LancamentoRequest;
import com.contabot.model.Cliente;
import com.contabot.model.Competencia;
import com.contabot.model.Lancamento;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.LancamentoRepository;
import com.contabot.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LancamentoServiceTest {

    @Mock private LancamentoRepository repository;
    @Mock private CompetenciaRepository competenciaRepository;
    @Mock private SecurityUtils securityUtils;

    private LancamentoService service;

    @BeforeEach
    void setUp() {
        service = new LancamentoService(repository, competenciaRepository, securityUtils);
    }

    @Test
    void cliente_nao_pode_criar_lancamento_em_competencia_de_outro_cliente() throws Exception {
        Cliente donoDaCompetencia = new Cliente("Dono", "111", "a@a.com", "62900000000", Cliente.Tipo.PESSOA_FISICA);
        setId(donoDaCompetencia, 1L);
        Competencia competencia = new Competencia(donoDaCompetencia, 2026, 9);
        setId(competencia, 10L);

        when(competenciaRepository.findById(10L)).thenReturn(Optional.of(competencia));
        // usuário logado é CLIENTE, mas vinculado ao cliente de id 2 (não é o dono da competência 10)
        when(securityUtils.clienteIdRestrito()).thenReturn(2L);

        LancamentoRequest request = new LancamentoRequest(10L, Lancamento.Tipo.RECEITA, "Serviço prestado",
                BigDecimal.TEN, LocalDate.now(), false);

        assertThrows(AccessDeniedException.class, () -> service.criar(request));
    }

    private void setId(Object entidade, Long id) throws Exception {
        Field campo = entidade.getClass().getDeclaredField("id");
        campo.setAccessible(true);
        campo.set(entidade, id);
    }
}
