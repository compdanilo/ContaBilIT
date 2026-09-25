package com.contabot.service;

import com.contabot.model.Documento;
import com.contabot.repository.DocumentoRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Regras de validação determinísticas para documentos — sem IA.
 * Cada regra devolve um motivo quando falha; a lista vazia significa documento válido.
 */
@Service
public class ValidacaoService {

    public enum Resultado {
        VALIDO, INCONSISTENTE, PENDENTE
    }

    public record ResultadoValidacao(Resultado resultado, List<String> motivos) {}

    private final DocumentoRepository documentoRepository;

    public ValidacaoService(DocumentoRepository documentoRepository) {
        this.documentoRepository = documentoRepository;
    }

    public ResultadoValidacao validar(Documento documento) {
        List<String> motivos = new ArrayList<>();

        if (documento.getDataDocumento() == null) {
            motivos.add("Documento sem data.");
        }
        if (documento.getValor() == null) {
            motivos.add("Documento sem valor informado.");
        }
        if (documento.getCliente() == null || documento.getCompetencia() == null
                || !documento.getCompetencia().getCliente().getId().equals(documento.getCliente().getId())) {
            motivos.add("Documento não pertence ao cliente da competência informada.");
        }
        if (ehDuplicado(documento)) {
            motivos.add("Possível duplicidade: já existe documento com o mesmo identificador nesta competência.");
        }

        if (motivos.isEmpty()) {
            return new ResultadoValidacao(Resultado.VALIDO, motivos);
        }
        // Falta de dado básico é considerado "pendente" (precisa de informação);
        // duplicidade e inconsistência de vínculo são "inconsistente".
        boolean apenasDadosFaltando = motivos.size() == 1
                && (documento.getDataDocumento() == null || documento.getValor() == null);
        return new ResultadoValidacao(apenasDadosFaltando ? Resultado.PENDENTE : Resultado.INCONSISTENTE, motivos);
    }

    private boolean ehDuplicado(Documento documento) {
        if (documento.getIdentificador() == null || documento.getCompetencia() == null) return false;
        return documentoRepository.findByCompetenciaId(documento.getCompetencia().getId()).stream()
                .anyMatch(d -> !d.getId().equals(documento.getId())
                        && documento.getIdentificador().equalsIgnoreCase(d.getIdentificador()));
    }
}
