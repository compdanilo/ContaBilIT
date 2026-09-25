package com.contabot.controller;

import com.contabot.dto.LancamentoRequest;
import com.contabot.dto.LancamentoResponse;
import com.contabot.service.LancamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lancamentos")
public class LancamentoController {
    private final LancamentoService service;
    public LancamentoController(LancamentoService service) { this.service = service; }

    @GetMapping
    public List<LancamentoResponse> listar(@RequestParam(required = false) Long competenciaId) {
        return competenciaId == null ? service.listar() : service.listarPorCompetencia(competenciaId);
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public LancamentoResponse criar(@Valid @RequestBody LancamentoRequest request) { return service.criar(request); }

    @PutMapping("/{id}")
    public LancamentoResponse atualizar(@PathVariable Long id, @Valid @RequestBody LancamentoRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
