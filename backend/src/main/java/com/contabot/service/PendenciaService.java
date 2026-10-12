package com.contabot.service;

import com.contabot.dto.PendenciaRequest;
import com.contabot.dto.PendenciaResponse;
import com.contabot.model.Competencia;
import com.contabot.model.Documento;
import com.contabot.model.Pendencia;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.repository.PendenciaRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PendenciaService {

    private final PendenciaRepository repository;
    private final CompetenciaRepository competenciaRepository;
    private final DocumentoRepository documentoRepository;
    private final SecurityUtils securityUtils;

    public PendenciaService(PendenciaRepository repository, CompetenciaRepository competenciaRepository,
                             DocumentoRepository documentoRepository, SecurityUtils securityUtils) {
        this.repository = repository;
        this.competenciaRepository = competenciaRepository;
        this.documentoRepository = documentoRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<PendenciaResponse> listar(Long competenciaId, Pendencia.Status status) {
        List<Pendencia> pendencias;
        if (competenciaId != null) {
            pendencias = repository.findByCompetenciaId(competenciaId);
        } else if (status != null) {
            pendencias = repository.findByStatus(status);
        } else {
            pendencias = repository.findAll();
        }
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null) {
            pendencias = pendencias.stream().filter(p -> p.getCompetencia().getCliente().getId().equals(restrito)).toList();
        }
        return pendencias.stream().map(this::toResponse).toList();
    }

    @Transactional
    public PendenciaResponse criar(PendenciaRequest request) {
        Competencia competencia = competenciaRepository.findById(request.competenciaId())
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada: " + request.competenciaId()));
        Documento documento = request.documentoId() == null ? null : documentoRepository.findById(request.documentoId())
                .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado: " + request.documentoId()));
        Pendencia pendencia = criarEntidade(competencia, documento, request.tipo(), request.descricao());
        return toResponse(repository.save(pendencia));
    }

    @Transactional
    public Pendencia criarEntidade(Competencia competencia, Documento documento, Pendencia.Tipo tipo, String descricao) {
        return repository.save(new Pendencia(competencia, documento, tipo, descricao));
    }

    @Transactional
    public PendenciaResponse atualizarStatus(Long id, Pendencia.Status status) {
        Pendencia pendencia = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pendência não encontrada: " + id));
        pendencia.setStatus(status);
        return toResponse(repository.save(pendencia));
    }

    private PendenciaResponse toResponse(Pendencia p) {
        return new PendenciaResponse(p.getId(), p.getCompetencia().getId(),
                p.getDocumento() == null ? null : p.getDocumento().getId(),
                p.getTipo(), p.getDescricao(), p.getStatus(), p.getCriadaEm(), p.getResolvidaEm());
    }
}
