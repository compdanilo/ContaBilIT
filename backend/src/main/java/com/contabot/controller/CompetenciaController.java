package com.contabot.controller;

import com.contabot.dto.CompetenciaDetalheResponse;
import com.contabot.dto.CompetenciaRequest;
import com.contabot.dto.CompetenciaResponse;
import com.contabot.dto.CompetenciaStatusRequest;
import com.contabot.service.CompetenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/competencias")
public class CompetenciaController {
    private final CompetenciaService service;
    public CompetenciaController(CompetenciaService service) { this.service = service; }

    @GetMapping
    public List<CompetenciaResponse> listar(@RequestParam(required = false) Long clienteId) {
        return service.listar(clienteId);
    }

    @GetMapping("/{id}")
    public CompetenciaDetalheResponse detalhar(@PathVariable Long id) { return service.detalhar(id); }

    @GetMapping("/minha-atual")
    public CompetenciaDetalheResponse minhaCompetenciaAtual() { return service.minhaCompetenciaAtual(); }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public CompetenciaResponse criar(@Valid @RequestBody CompetenciaRequest request) { return service.criar(request); }

    @PutMapping("/{id}/status")
    public CompetenciaResponse atualizarStatus(@PathVariable Long id, @Valid @RequestBody CompetenciaStatusRequest request) {
        return service.atualizarStatus(id, request.status());
    }
}
