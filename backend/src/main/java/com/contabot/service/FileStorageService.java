package com.contabot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Storage local em disco: separa os bytes do arquivo (aqui) dos metadados (no banco,
 * via Documento.caminhoArquivo). Pode ser trocado por um object storage real no futuro
 * sem alterar quem o utiliza, desde que a mesma interface pública seja preservada.
 */
@Service
public class FileStorageService {

    private final Path raiz;

    public FileStorageService(@Value("${app.storage.path:./storage}") String caminho) {
        this.raiz = Paths.get(caminho).toAbsolutePath().normalize();
        try {
            Files.createDirectories(raiz);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível criar o diretório de storage: " + raiz, e);
        }
    }

    /** Salva o arquivo com nome único e devolve o nome armazenado (o que é gravado no banco). */
    public String salvar(MultipartFile file) {
        String nomeArmazenado = UUID.randomUUID() + extensaoDe(file.getOriginalFilename());
        try {
            Files.copy(file.getInputStream(), raiz.resolve(nomeArmazenado));
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao salvar o arquivo enviado.", e);
        }
        return nomeArmazenado;
    }

    public Resource carregar(String nomeArmazenado) {
        try {
            Path caminho = raiz.resolve(nomeArmazenado).normalize();
            if (!caminho.startsWith(raiz)) {
                throw new IllegalArgumentException("Caminho de arquivo inválido.");
            }
            Resource recurso = new UrlResource(caminho.toUri());
            if (!recurso.exists() || !recurso.isReadable()) {
                throw new IllegalArgumentException("Arquivo não encontrado no storage: " + nomeArmazenado);
            }
            return recurso;
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Caminho de arquivo inválido.", e);
        }
    }

    private String extensaoDe(String nomeOriginal) {
        if (nomeOriginal == null) return "";
        int ponto = nomeOriginal.lastIndexOf('.');
        return ponto >= 0 ? nomeOriginal.substring(ponto) : "";
    }
}
