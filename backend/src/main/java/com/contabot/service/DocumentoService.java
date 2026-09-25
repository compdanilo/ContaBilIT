package com.contabot.service;

import com.contabot.dto.DocumentoAtualizacaoRequest;
import com.contabot.dto.DocumentoResponse;
import com.contabot.model.Cliente;
import com.contabot.model.Competencia;
import com.contabot.model.Documento;
import com.contabot.model.Pendencia;
import com.contabot.repository.ClienteRepository;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.DocumentoRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class DocumentoService {

    private final DocumentoRepository repository;
    private final ClienteRepository clienteRepository;
    private final CompetenciaRepository competenciaRepository;
    private final ValidacaoService validacaoService;
    private final PendenciaService pendenciaService;
    private final FileStorageService fileStorageService;
    private final ExtracaoService extracaoService;
    private final SecurityUtils securityUtils;

    public DocumentoService(DocumentoRepository repository, ClienteRepository clienteRepository,
                             CompetenciaRepository competenciaRepository, ValidacaoService validacaoService,
                             PendenciaService pendenciaService, FileStorageService fileStorageService,
                             ExtracaoService extracaoService, SecurityUtils securityUtils) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.competenciaRepository = competenciaRepository;
        this.validacaoService = validacaoService;
        this.pendenciaService = pendenciaService;
        this.fileStorageService = fileStorageService;
        this.extracaoService = extracaoService;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<DocumentoResponse> listar(Long competenciaId) {
        List<Documento> documentos = competenciaId == null ? repository.findAll() : repository.findByCompetenciaId(competenciaId);
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null) {
            documentos = documentos.stream().filter(d -> d.getCliente().getId().equals(restrito)).toList();
        }
        return documentos.stream().map(this::toResponse).toList();
    }

    @Transactional
    public List<DocumentoResponse> processarUpload(Long clienteId, Long competenciaId, MultipartFile[] files) {
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null && !restrito.equals(clienteId)) {
            throw new AccessDeniedException("Você só pode enviar documentos para o seu próprio cadastro.");
        }

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado: " + clienteId));
        Competencia competencia = competenciaRepository.findById(competenciaId)
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada: " + competenciaId));
        if (!competencia.getCliente().getId().equals(cliente.getId())) {
            throw new IllegalStateException("A competência informada não pertence a este cliente.");
        }

        List<DocumentoResponse> respostas = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            Documento documento = new Documento(cliente, competencia, file.getOriginalFilename(),
                    identificarTipo(file.getOriginalFilename()), LocalDateTime.now());
            documento.setCaminhoArquivo(fileStorageService.salvar(file));

            var extraidos = extracaoService.extrair(file, file.getOriginalFilename());
            documento.setDataDocumento(extraidos.data());
            documento.setValor(extraidos.valor());
            documento.setIdentificador(extraidos.identificador());

            documento = repository.save(documento);
            aplicarValidacao(documento);
            respostas.add(toResponse(documento));
        }
        return respostas;
    }

    @Transactional
    public DocumentoResponse atualizar(Long id, DocumentoAtualizacaoRequest request) {
        Documento documento = buscarEntidade(id);
        documento.setStatus(request.status());
        documento.setObservacao(request.observacao());
        return toResponse(repository.save(documento));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> baixarArquivo(Long id) {
        Documento documento = buscarEntidade(id);
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null && !restrito.equals(documento.getCliente().getId())) {
            throw new AccessDeniedException("Este documento não pertence ao seu cadastro.");
        }
        if (documento.getCaminhoArquivo() == null) {
            throw new IllegalArgumentException("Este documento não possui arquivo armazenado.");
        }
        Resource recurso = fileStorageService.carregar(documento.getCaminhoArquivo());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documento.getNomeArquivo() + "\"")
                .body(recurso);
    }

    private Documento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado: " + id));
    }

    /** Roda as regras determinísticas e, se necessário, abre pendência automaticamente. */
    private void aplicarValidacao(Documento documento) {
        var resultado = validacaoService.validar(documento);
        switch (resultado.resultado()) {
            case VALIDO -> documento.setStatus(Documento.Status.VALIDADO);
            case PENDENTE -> {
                documento.setStatus(Documento.Status.PENDENTE);
                pendenciaService.criarEntidade(documento.getCompetencia(), documento,
                        Pendencia.Tipo.INFORMACAO_NECESSARIA, String.join(" ", resultado.motivos()));
            }
            case INCONSISTENTE -> {
                documento.setStatus(Documento.Status.EM_ANALISE);
                pendenciaService.criarEntidade(documento.getCompetencia(), documento,
                        Pendencia.Tipo.DOCUMENTO_INCONSISTENTE, String.join(" ", resultado.motivos()));
            }
        }
        repository.save(documento);
    }

    private Documento.Tipo identificarTipo(String nomeArquivo) {
        if (nomeArquivo == null) return Documento.Tipo.OUTRO;
        String nome = nomeArquivo.toLowerCase(Locale.ROOT);
        if (nome.contains("nota") || nome.endsWith(".xml")) return Documento.Tipo.NOTA_FISCAL;
        if (nome.contains("recibo")) return Documento.Tipo.RECIBO;
        if (nome.contains("comprovante")) return Documento.Tipo.COMPROVANTE;
        if (nome.endsWith(".pdf")) return Documento.Tipo.DOCUMENTO_FISCAL;
        return Documento.Tipo.OUTRO;
    }

    private DocumentoResponse toResponse(Documento d) {
        return new DocumentoResponse(d.getId(), d.getCliente().getId(), d.getCliente().getNome(),
                d.getCompetencia().getId(), d.getNomeArquivo(), d.getTipo(), d.getStatus(),
                d.getDataDocumento(), d.getValor(), d.getIdentificador(), d.getEnviadoEm(), d.getObservacao());
    }
}
