package com.contabot.controller;

import com.contabot.dto.DocumentoAtualizacaoRequest;
import com.contabot.dto.DocumentoResponse;
import com.contabot.service.DocumentoService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documentos")
public class DocumentoController {
    private final DocumentoService service;
    public DocumentoController(DocumentoService service) { this.service = service; }

    @GetMapping
    public List<DocumentoResponse> listar(@RequestParam(required = false) Long competenciaId) {
        return service.listar(competenciaId);
    }

    @PostMapping("/upload") @ResponseStatus(HttpStatus.CREATED)
    public List<DocumentoResponse> upload(@RequestParam Long clienteId, @RequestParam Long competenciaId,
                                           @RequestParam("files") MultipartFile[] files) {
        return service.processarUpload(clienteId, competenciaId, files);
    }

    @PutMapping("/{id}")
    public DocumentoResponse atualizar(@PathVariable Long id, @Valid @RequestBody DocumentoAtualizacaoRequest request) {
        return service.atualizar(id, request);
    }

    @GetMapping("/{id}/arquivo")
    public ResponseEntity<Resource> baixar(@PathVariable Long id) {
        return service.baixarArquivo(id);
    }
}
