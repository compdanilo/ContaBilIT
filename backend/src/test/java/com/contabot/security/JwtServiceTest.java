package com.contabot.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService service;

    @BeforeEach
    void setUp() {
        // segredo de teste com 32+ caracteres, exigido pelo algoritmo HS256
        service = new JwtService("chave-de-teste-com-pelo-menos-32-caracteres-1234", 60_000);
    }

    @Test
    void token_gerado_deve_ser_valido_para_o_mesmo_email() {
        String token = service.gerarToken("contador@contabilit.com.br", Map.of("papel", "CONTADOR"));

        assertEquals("contador@contabilit.com.br", service.extrairEmail(token));
        assertTrue(service.tokenValido(token, "contador@contabilit.com.br"));
    }

    @Test
    void token_nao_deve_ser_valido_para_email_diferente() {
        String token = service.gerarToken("contador@contabilit.com.br", Map.of());

        assertFalse(service.tokenValido(token, "outro@contabilit.com.br"));
    }
}
