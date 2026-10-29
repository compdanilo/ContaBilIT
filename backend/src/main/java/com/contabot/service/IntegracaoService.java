package com.contabot.service;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class IntegracaoService {

    private final HttpClient httpClient;

    public IntegracaoService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public String consultarCnpj(String cnpj) {
        String apenasDigitos = cnpj == null ? "" : cnpj.replaceAll("\\D", "");
        if (apenasDigitos.length() != 14) {
            throw new IllegalArgumentException("CNPJ inválido. Deve conter exatamente 14 dígitos.");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://brasilapi.com.br/api/cnpj/v1/" + apenasDigitos))
                    .timeout(Duration.ofSeconds(6))
                    .header("Accept", "application/json")
                    .header("User-Agent", "ContaBilIT/1.0 (Buriti Solutions; contabilidade tech)")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return response.body();
            } else if (response.statusCode() == 404) {
                throw new IllegalArgumentException("CNPJ não localizado na base da Receita Federal.");
            } else {
                throw new IllegalStateException("Falha ao comunicar com o serviço da Receita Federal (HTTP " + response.statusCode() + ").");
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("Erro de conectividade ao consultar API externa de CNPJ: " + e.getMessage(), e);
        }
    }
}

