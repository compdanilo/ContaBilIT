package com.contabot.service;

import com.contabot.dto.LancamentoRequest;
import com.contabot.dto.LancamentoResponse;
import com.contabot.model.Competencia;
import com.contabot.model.Lancamento;
import com.contabot.repository.CompetenciaRepository;
import com.contabot.repository.LancamentoRepository;
import com.contabot.security.SecurityUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LancamentoService {

    private final LancamentoRepository repository;
    private final CompetenciaRepository competenciaRepository;
    private final SecurityUtils securityUtils;

    public LancamentoService(LancamentoRepository repository, CompetenciaRepository competenciaRepository,
                              SecurityUtils securityUtils) {
        this.repository = repository;
        this.competenciaRepository = competenciaRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<LancamentoResponse> listar() {
        return aplicarEscopo(repository.findAll()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<LancamentoResponse> listarPorCompetencia(Long competenciaId) {
        return aplicarEscopo(repository.findByCompetenciaId(competenciaId)).stream().map(this::toResponse).toList();
    }

    private List<Lancamento> aplicarEscopo(List<Lancamento> lista) {
        Long restrito = securityUtils.clienteIdRestrito();
        return restrito == null ? lista
                : lista.stream().filter(l -> l.getCompetencia().getCliente().getId().equals(restrito)).toList();
    }

    @Transactional
    public LancamentoResponse criar(LancamentoRequest request) {
        Lancamento lancamento = new Lancamento();
        return toResponse(repository.save(aplicar(lancamento, request)));
    }

    @Transactional
    public LancamentoResponse atualizar(Long id, LancamentoRequest request) {
        Lancamento lancamento = buscarEntidade(id);
        return toResponse(repository.save(aplicar(lancamento, request)));
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntidade(id));
    }

    private Lancamento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lançamento não encontrado: " + id));
    }

    private Lancamento aplicar(Lancamento lancamento, LancamentoRequest request) {
        Competencia competencia = competenciaRepository.findById(request.competenciaId())
                .orElseThrow(() -> new IllegalArgumentException("Competência não encontrada: " + request.competenciaId()));
        Long restrito = securityUtils.clienteIdRestrito();
        if (restrito != null && !restrito.equals(competencia.getCliente().getId())) {
            throw new AccessDeniedException("Esta competência não pertence ao seu cadastro.");
        }
        lancamento.setCompetencia(competencia);
        lancamento.setTipo(request.tipo());
        lancamento.setDescricao(request.descricao().trim());
        lancamento.setValor(request.valor());
        lancamento.setVencimento(request.vencimento());
        lancamento.setPago(request.pago());
        return lancamento;
    }

    private LancamentoResponse toResponse(Lancamento l) {
        return new LancamentoResponse(l.getId(), l.getCompetencia().getId(), l.getTipo(), l.getDescricao(),
                l.getValor(), l.getVencimento(), l.isPago());
    }
}
