package com.contabot.service;

import com.contabot.dto.CompetenciaDetalheResponse;
import com.contabot.dto.CompetenciaRequest;
import com.contabot.dto.CompetenciaResponse;
import com.contabot.model.Cliente;
import com.contabot.model.Competencia;
import com.contabot.model.Documento;
import com.contabot.model.Pendencia;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.repository.PendenciaRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class CompetenciaService {

    private final CompetenciaRepository repository;
    private final DocumentoRepository documentoRepository;
    private final PendenciaRepository pendenciaRepository;
    private final ClienteService clienteService;
    private final LancamentoService lancamentoService;
    private final RelatorioService relatorioService;
    private final SecurityUtils securityUtils;

    public CompetenciaService(CompetenciaRepository repository, DocumentoRepository documentoRepository,
                               PendenciaRepository pendenciaRepository, ClienteService clienteService,
                               LancamentoService lancamentoService, RelatorioService relatorioService,
                               SecurityUtils securityUtils) {
        this.repository = repository;
        this.documentoRepository = documentoRepository;
        this.pendenciaRepository = pendenciaRepository;
        this.clienteService = clienteService;
        this.lancamentoService = lancamentoService;
        this.relatorioService = relatorioService;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<CompetenciaResponse> listar(Long clienteId) {
        Long restrito = securityUtils.clienteIdRestrito();
        Long efetivo = restrito != null ? restrito : clienteId;
        List<Competencia> competencias = efetivo == null ? repository.findAll() : repository.findByClienteId(efetivo);
        return competencias.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Competencia buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public CompetenciaDetalheResponse detalhar(Long id) {
        Competencia competencia = buscarEntidade(id);
        verificarAcesso(competencia);
        return montarDetalhe(competencia);
    }

    /** Papel CLIENTE: devolve o detalhe da competência mais recente do próprio cliente. */
    @Transactional(readOnly = true)
    public CompetenciaDetalheResponse minhaCompetenciaAtual() {
        Long clienteId = securityUtils.clienteIdRestrito();
        if (clienteId == null) {
            throw new IllegalStateException("Este endpoint é exclusivo para logins do papel CLIENTE.");
        }
        Competencia maisRecente = repository.findByClienteId(clienteId).stream()
                .max(Comparator.comparing(Competencia::getCriadaEm))
                .orElseThrow(() -> new IllegalArgumentException("Nenhuma competência encontrada para este cliente ainda."));
        return montarDetalhe(maisRecente);
    }

    private void verificarAcesso(Competencia competencia) {
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null && !restrito.equals(competencia.getCliente().getId())) {
            throw new AccessDeniedException("Esta competência não pertence ao seu cadastro.");
        }
    }

    private CompetenciaDetalheResponse montarDetalhe(Competencia competencia) {
        Long id = competencia.getId();
        return new CompetenciaDetalheResponse(
                toResponse(competencia),
                documentoRepository.findByCompetenciaId(id).stream().map(this::documentoParaResponse).toList(),
                lancamentoService.listarPorCompetencia(id),
                pendenciaRepository.findByCompetenciaId(id).stream().map(this::pendenciaParaResponse).toList(),
                relatorioService.buscarPorCompetencia(id).orElse(null)
        );
    }

    @Transactional
    public CompetenciaResponse criar(CompetenciaRequest request) {
        Cliente cliente = clienteService.buscarEntidade(request.clienteId());
        repository.findByClienteIdAndAnoAndMes(cliente.getId(), request.ano(), request.mes()).ifPresent(c -> {
            throw new IllegalStateException("Já existe uma competência %02d/%d para este cliente".formatted(request.mes(), request.ano()));
        });
        Competencia competencia = new Competencia(cliente, request.ano(), request.mes());
        return toResponse(repository.save(competencia));
    }

    @Transactional
    public CompetenciaResponse atualizarStatus(Long id, Competencia.Status status) {
        Competencia competencia = buscarEntidade(id);
        competencia.setStatus(status);
        if (status == Competencia.Status.ENCERRADA) {
            competencia.setFechadaEm(java.time.LocalDateTime.now());
        }
        return toResponse(repository.save(competencia));
    }

    private CompetenciaResponse toResponse(Competencia c) {
        long total = documentoRepository.findByCompetenciaId(c.getId()).size();
        long validados = documentoRepository.findByCompetenciaId(c.getId()).stream()
                .filter(d -> d.getStatus() == Documento.Status.VALIDADO).count();
        List<Pendencia> pendencias = pendenciaRepository.findByCompetenciaId(c.getId());
        long abertas = pendencias.stream().filter(p -> p.getStatus() == Pendencia.Status.ABERTA || p.getStatus() == Pendencia.Status.EM_ANALISE).count();
        return new CompetenciaResponse(
                c.getId(), clienteService.toResponse(c.getCliente()), c.getAno(), c.getMes(), c.getStatus(),
                c.getCriadaEm(), c.getFechadaEm(), total, validados, pendencias.size(), abertas
        );
    }

    private com.contabot.dto.DocumentoResponse documentoParaResponse(Documento d) {
        return new com.contabot.dto.DocumentoResponse(
                d.getId(), d.getCliente().getId(), d.getCliente().getNome(), d.getCompetencia().getId(),
                d.getNomeArquivo(), d.getTipo(), d.getStatus(), d.getDataDocumento(), d.getValor(),
                d.getIdentificador(), d.getEnviadoEm(), d.getObservacao()
        );
    }

    private com.contabot.dto.PendenciaResponse pendenciaParaResponse(Pendencia p) {
        return new com.contabot.dto.PendenciaResponse(
                p.getId(), p.getCompetencia().getId(), p.getDocumento() == null ? null : p.getDocumento().getId(),
                p.getTipo(), p.getDescricao(), p.getStatus(), p.getCriadaEm(), p.getResolvidaEm()
        );
    }
}
