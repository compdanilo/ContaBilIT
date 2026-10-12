package com.contabot.controller;

import com.contabot.dto.PendenciaRequest;
import com.contabot.dto.PendenciaResponse;
import com.contabot.dto.PendenciaStatusRequest;
import com.contabot.model.Pendencia;
import com.contabot.service.PendenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pendencias")
public class PendenciaController {
    private final PendenciaService service;
    public PendenciaController(PendenciaService service) { this.service = service; }

    @GetMapping
    public List<PendenciaResponse> listar(@RequestParam(required = false) Long competenciaId,
                                           @RequestParam(required = false) Pendencia.Status status) {
        return service.listar(competenciaId, status);
    }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public PendenciaResponse criar(@Valid @RequestBody PendenciaRequest request) { return service.criar(request); }

    @PutMapping("/{id}/status")
    public PendenciaResponse atualizarStatus(@PathVariable Long id, @Valid @RequestBody PendenciaStatusRequest request) {
        return service.atualizarStatus(id, request.status());
    }
}
