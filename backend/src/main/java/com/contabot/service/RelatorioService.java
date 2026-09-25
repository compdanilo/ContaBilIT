package com.contabot.service;

import com.contabot.dto.RelatorioDevolverRequest;
import com.contabot.dto.RelatorioResponse;
import com.contabot.model.Competencia;
import com.contabot.model.Documento;
import com.contabot.model.Lancamento;
import com.contabot.model.Pendencia;
import com.contabot.model.Relatorio;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.repository.LancamentoRepository;
import com.contabot.repository.PendenciaRepository;
import com.contabot.repository.RelatorioRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class RelatorioService {

    private final RelatorioRepository repository;
    private final CompetenciaRepository competenciaRepository;
    private final DocumentoRepository documentoRepository;
    private final LancamentoRepository lancamentoRepository;
    private final PendenciaRepository pendenciaRepository;
    private final PendenciaService pendenciaService;
    private final SecurityUtils securityUtils;

    public RelatorioService(RelatorioRepository repository, CompetenciaRepository competenciaRepository,
                             DocumentoRepository documentoRepository, LancamentoRepository lancamentoRepository,
                             PendenciaRepository pendenciaRepository, PendenciaService pendenciaService,
                             SecurityUtils securityUtils) {
        this.repository = repository;
        this.competenciaRepository = competenciaRepository;
        this.documentoRepository = documentoRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.pendenciaRepository = pendenciaRepository;
        this.pendenciaService = pendenciaService;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public Optional<RelatorioResponse> buscarPorCompetencia(Long competenciaId) {
        return repository.findByCompetenciaId(competenciaId).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<RelatorioResponse> listar() {
        List<Relatorio> lista = repository.findAll();
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null) {
            lista = lista.stream().filter(r -> r.getCompetencia().getCliente().getId().equals(restrito)).toList();
        }
        return lista.stream().map(this::toResponse).toList();
    }

    /** Gera (ou recalcula, se já existir) o relatório consolidado da competência. */
    @Transactional
    public RelatorioResponse gerar(Long competenciaId) {
        Competencia competencia = buscarCompetencia(competenciaId);
        Relatorio relatorio = repository.findByCompetenciaId(competenciaId).orElseGet(() -> new Relatorio(competencia));
        relatorio.setStatus(Relatorio.Status.GERADO);
        relatorio = repository.save(relatorio);

        competencia.setStatus(Competencia.Status.AGUARDANDO_VALIDACAO);
        competenciaRepository.save(competencia);

        return toResponse(relatorio);
    }

    @Transactional
    public RelatorioResponse validar(Long id, String observacoes) {
        Relatorio relatorio = buscarEntidade(id);
        relatorio.setStatus(Relatorio.Status.VALIDADO);
        relatorio.setObservacoes(observacoes);
        repository.save(relatorio);

        Competencia competencia = relatorio.getCompetencia();
        competencia.setStatus(Competencia.Status.VALIDADA);
        competenciaRepository.save(competencia);

        return toResponse(relatorio);
    }

    @Transactional
    public RelatorioResponse devolver(Long id, RelatorioDevolverRequest request) {
        Relatorio relatorio = buscarEntidade(id);
        relatorio.setStatus(Relatorio.Status.DEVOLVIDO);
        relatorio.setObservacoes(request.observacoes());
        repository.save(relatorio);

        Competencia competencia = relatorio.getCompetencia();
        competencia.setStatus(Competencia.Status.PENDENTE);
        competenciaRepository.save(competencia);

        if (request.criarPendencia() && StringUtils.hasText(request.descricaoPendencia())) {
            var tipo = request.tipoPendencia() == null ? Pendencia.Tipo.INFORMACAO_NECESSARIA : request.tipoPendencia();
            pendenciaService.criarEntidade(competencia, null, tipo, request.descricaoPendencia());
        }

        return toResponse(relatorio);
    }

    private Relatorio buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Relatório não encontrado: " + id));
    }

    private Competencia buscarCompetencia(Long id) {
        return competenciaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada: " + id));
    }

    private RelatorioResponse toResponse(Relatorio r) {
        Long competenciaId = r.getCompetencia().getId();
        List<Lancamento> lancamentos = lancamentoRepository.findByCompetenciaId(competenciaId);
        BigDecimal receitas = lancamentos.stream().filter(l -> l.getTipo() == Lancamento.Tipo.RECEITA)
                .map(Lancamento::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal despesas = lancamentos.stream().filter(l -> l.getTipo() == Lancamento.Tipo.DESPESA)
                .map(Lancamento::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Documento> documentos = documentoRepository.findByCompetenciaId(competenciaId);
        long validados = documentos.stream().filter(d -> d.getStatus() == Documento.Status.VALIDADO).count();

        List<Pendencia> pendencias = pendenciaRepository.findByCompetenciaId(competenciaId);
        long abertas = pendencias.stream()
                .filter(p -> p.getStatus() == Pendencia.Status.ABERTA || p.getStatus() == Pendencia.Status.EM_ANALISE)
                .count();

        return new RelatorioResponse(r.getId(), competenciaId, r.getGeradoEm(), r.getStatus(), r.getObservacoes(),
                receitas, despesas, receitas.subtract(despesas), documentos.size(), validados, pendencias.size(), abertas);
    }
}
