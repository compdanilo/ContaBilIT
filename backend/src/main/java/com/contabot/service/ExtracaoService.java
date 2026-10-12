package com.contabot.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ExtracaoService {

    public record DadosExtraidos(LocalDate data, BigDecimal valor, String identificador) {
        static final DadosExtraidos VAZIO = new DadosExtraidos(null, null, null);
    }

    private static final Pattern VALOR_PATTERN = Pattern.compile("R\\$\\s?([0-9]{1,3}(?:\\.[0-9]{3})*,[0-9]{2})");
    private static final Pattern DATA_PATTERN = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})");

    public DadosExtraidos extrair(MultipartFile file, String nomeArquivo) {
        try {
            String nome = nomeArquivo == null ? "" : nomeArquivo.toLowerCase();
            if (nome.endsWith(".xml")) {
                return extrairDeXmlNfe(file.getInputStream());
            }
            if (nome.endsWith(".pdf")) {
                return extrairDePdf(file.getInputStream());
            }
        } catch (Exception e) {
        }
        return DadosExtraidos.VAZIO;
    }

    private DadosExtraidos extrairDeXmlNfe(InputStream input) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setNamespaceAware(true);
        Document doc = factory.newDocumentBuilder().parse(input);

        BigDecimal valor = textoDeTag(doc, "vNF").map(this::paraBigDecimal).orElse(null);
        String dataTexto = textoDeTag(doc, "dhEmi").or(() -> textoDeTag(doc, "dEmi")).orElse(null);
        LocalDate data = dataTexto == null || dataTexto.length() < 10 ? null : LocalDate.parse(dataTexto.substring(0, 10));
        String chave = chaveDeAcesso(doc);

        return new DadosExtraidos(data, valor, chave);
    }

    private Optional<String> textoDeTag(Document doc, String tag) {
        NodeList lista = doc.getElementsByTagName(tag);
        if (lista.getLength() == 0) return Optional.empty();
        return Optional.ofNullable(lista.item(0).getTextContent());
    }

    private String chaveDeAcesso(Document doc) {
        NodeList infNFe = doc.getElementsByTagName("infNFe");
        if (infNFe.getLength() == 0) return null;
        Element elemento = (Element) infNFe.item(0);
        String id = elemento.getAttribute("Id");
        return (id == null || id.isBlank()) ? null : id.replace("NFe", "");
    }

    private BigDecimal paraBigDecimal(String texto) {
        try {
            return new BigDecimal(texto.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private DadosExtraidos extrairDePdf(InputStream input) throws IOException {
        try (PDDocument documento = Loader.loadPDF(input.readAllBytes())) {
            String texto = new PDFTextStripper().getText(documento);
            return new DadosExtraidos(buscarData(texto), buscarValor(texto), null);
        }
    }

    private BigDecimal buscarValor(String texto) {
        Matcher m = VALOR_PATTERN.matcher(texto);
        BigDecimal maior = null;
        while (m.find()) {
            BigDecimal atual = new BigDecimal(m.group(1).replace(".", "").replace(",", "."));
            if (maior == null || atual.compareTo(maior) > 0) maior = atual;
        }
        return maior;
    }

    private LocalDate buscarData(String texto) {
        Matcher m = DATA_PATTERN.matcher(texto);
        if (!m.find()) return null;
        try {
            return LocalDate.of(Integer.parseInt(m.group(3)), Integer.parseInt(m.group(2)), Integer.parseInt(m.group(1)));
        } catch (Exception e) {
            return null;
        }
    }
}
