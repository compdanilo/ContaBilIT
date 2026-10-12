package com.contabot.controller;

import com.contabot.dto.RelatorioDevolverRequest;
import com.contabot.dto.RelatorioObservacaoRequest;
import com.contabot.dto.RelatorioResponse;
import com.contabot.service.RelatorioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/relatorios")
public class RelatorioController {
    private final RelatorioService service;
    public RelatorioController(RelatorioService service) { this.service = service; }

    @GetMapping public List<RelatorioResponse> listar() { return service.listar(); }

    @PostMapping("/competencias/{competenciaId}") @ResponseStatus(HttpStatus.CREATED)
    public RelatorioResponse gerar(@PathVariable Long competenciaId) { return service.gerar(competenciaId); }

    @PostMapping("/{id}/validar")
    public RelatorioResponse validar(@PathVariable Long id, @RequestBody(required = false) RelatorioObservacaoRequest request) {
        return service.validar(id, request == null ? null : request.observacoes());
    }

    @PostMapping("/{id}/devolver")
    public RelatorioResponse devolver(@PathVariable Long id, @Valid @RequestBody RelatorioDevolverRequest request) {
        return service.devolver(id, request);
    }
}
