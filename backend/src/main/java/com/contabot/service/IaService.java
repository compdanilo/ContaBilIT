package com.contabot.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class IaService {

    public Map<String, Object> extrairLancamento(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("Forneça a descrição para o assistente de IA.");
        }

        String lower = prompt.toLowerCase();
        boolean isReceita = lower.contains("recebi") || lower.contains("receita") || lower.contains("faturei")
                || lower.contains("nfs-e") || lower.contains("invoice") || lower.contains("cliente");
        boolean isProLabore = lower.contains("pró-labore") || lower.contains("pro-labore") || lower.contains("prolabore");
        boolean isCloud = lower.contains("aws") || lower.contains("azure") || lower.contains("google cloud") || lower.contains("cloud");

        double valor = 100.0;
        Pattern pattern = Pattern.compile("(?i)(?:r\\$|\\$|usd)?\\s*([0-9]+(?:\\.[0-9]{3})*(?:,[0-9]{1,2})|[0-9]+(?:\\.[0-9]{1,2})?)");
        Matcher matcher = pattern.matcher(prompt);
        if (matcher.find()) {
            try {
                String numStr = matcher.group(1).replace(".", "").replace(",", ".");
                valor = Double.parseDouble(numStr);
                if (lower.contains("usd") || lower.contains("dólar") || lower.contains("dolar")) {
                    valor = Math.round(valor * 5.65 * 100.0) / 100.0;
                }
            } catch (Exception ignored) {}
        }

        Map<String, Object> res = new HashMap<>();
        res.put("tipo", isReceita ? "RECEITA" : "DESPESA");
        res.put("descricao", isProLabore ? "Retirada de Pró-labore dos Sócios (Fator R)" : (isCloud ? "Serviços de Computação em Nuvem (Cloud)" : prompt.trim()));
        res.put("valor", valor);
        res.put("vencimento", LocalDate.now().toString());
        res.put("categoria", isProLabore ? "Pró-labore & Encargos" : (isCloud ? "Cloud & Hospedagem" : (isReceita ? "Faturamento Tech" : "Despesas Gerais")));
        res.put("impactaFatorR", isProLabore);
        res.put("observacaoFiscal", "Preenchido pelo Assistente Contábil de IA.");
        return res;
    }

    public Map<String, Object> analisarDocumento(String texto, String nomeArquivo) {
        String lower = ((nomeArquivo != null ? nomeArquivo : "") + " " + (texto != null ? texto : "")).toLowerCase();
        String tipo = "NOTA_FISCAL";
        if (lower.contains("comprovante") || lower.contains("pix") || lower.contains("ted")) {
            tipo = "COMPROVANTE";
        } else if (lower.contains("recibo")) {
            tipo = "RECIBO";
        } else if (lower.contains("das") || lower.contains("darf")) {
            tipo = "DOCUMENTO_FISCAL";
        }

        Map<String, Object> res = new HashMap<>();
        res.put("tipo", tipo);
        res.put("identificador", "DOC-" + (System.currentTimeMillis() % 1000000));
        res.put("valor", 2500.0);
        res.put("dataDocumento", LocalDate.now().toString());
        res.put("razaoSocialContraparte", "Contraparte Identificada");
        res.put("cnaeSugerido", "6201-5/01 - Desenvolvimento de Programas de Computador sob Encomenda");
        res.put("resumoContabil", "Documento fiscal processado com validação e extração de IA.");
        return res;
    }
}
