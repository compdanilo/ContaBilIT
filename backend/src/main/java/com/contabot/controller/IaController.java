package com.contabot.controller;

import com.contabot.service.IaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ia")
public class IaController {

    private final IaService iaService;

    public IaController(IaService iaService) {
        this.iaService = iaService;
    }

    @PostMapping("/extrair-lancamento")
    public ResponseEntity<Map<String, Object>> extrairLancamento(@RequestBody Map<String, String> body) {
        String prompt = body != null ? body.get("prompt") : null;
        return ResponseEntity.ok(iaService.extrairLancamento(prompt));
    }

    @PostMapping("/analisar-documento")
    public ResponseEntity<Map<String, Object>> analisarDocumento(@RequestBody Map<String, String> body) {
        String texto = body != null ? body.get("texto") : null;
        String nomeArquivo = body != null ? body.get("nomeArquivo") : null;
        return ResponseEntity.ok(iaService.analisarDocumento(texto, nomeArquivo));
    }
}
