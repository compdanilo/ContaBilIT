package com.contabot.service;

import com.contabot.dto.DashboardResponse;
import com.contabot.model.Competencia;
import com.contabot.model.Lancamento;
import com.contabot.model.Pendencia;
import com.contabot.repository.ClienteRepository;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.repository.LancamentoRepository;
import com.contabot.repository.PendenciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final ClienteRepository clientes;
    private final CompetenciaRepository competencias;
    private final DocumentoRepository documentos;
    private final LancamentoRepository lancamentos;
    private final PendenciaRepository pendencias;

    public DashboardService(ClienteRepository clientes, CompetenciaRepository competencias,
                             DocumentoRepository documentos, LancamentoRepository lancamentos,
                             PendenciaRepository pendencias) {
        this.clientes = clientes;
        this.competencias = competencias;
        this.documentos = documentos;
        this.lancamentos = lancamentos;
        this.pendencias = pendencias;
    }

    @Transactional(readOnly = true)
    public DashboardResponse resumo() {
        List<Competencia> todasCompetencias = competencias.findAll();

        long abertas = contar(todasCompetencias, Competencia.Status.ABERTA, Competencia.Status.EM_PROCESSAMENTO);
        long aguardando = contar(todasCompetencias, Competencia.Status.AGUARDANDO_VALIDACAO);
        long validadas = contar(todasCompetencias, Competencia.Status.VALIDADA, Competencia.Status.ENCERRADA);
        long comPendencias = contar(todasCompetencias, Competencia.Status.PENDENTE);

        long pendenciasAbertas = pendencias.findAll().stream()
                .filter(p -> p.getStatus() == Pendencia.Status.ABERTA || p.getStatus() == Pendencia.Status.EM_ANALISE)
                .count();

        BigDecimal receitas = BigDecimal.ZERO;
        BigDecimal despesas = BigDecimal.ZERO;
        for (Lancamento l : lancamentos.findAll()) {
            if (l.getValor() == null) continue;
            if (l.getTipo() == Lancamento.Tipo.RECEITA) receitas = receitas.add(l.getValor());
            else despesas = despesas.add(l.getValor());
        }

        return new DashboardResponse(
                clientes.count(), abertas, aguardando, validadas, comPendencias,
                documentos.count(), pendenciasAbertas, receitas, despesas, receitas.subtract(despesas)
        );
    }

    private long contar(List<Competencia> lista, Competencia.Status... status) {
        var conjunto = java.util.Set.of(status);
        return lista.stream().filter(c -> conjunto.contains(c.getStatus())).count();
    }
}
