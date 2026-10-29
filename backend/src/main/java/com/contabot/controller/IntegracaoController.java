package com.contabot.controller;

import com.contabot.service.IntegracaoService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/integracoes")
public class IntegracaoController {

    private final IntegracaoService service;

    public IntegracaoController(IntegracaoService service) {
        this.service = service;
    }

    @GetMapping(value = "/cnpj/{cnpj}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> consultarCnpj(@PathVariable String cnpj) {
        return ResponseEntity.ok(service.consultarCnpj(cnpj));
    }
}

