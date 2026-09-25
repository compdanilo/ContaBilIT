package com.contabot.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class PendenciaTest {

    @Test
    void resolvidaEm_deve_ser_preenchida_ao_marcar_como_resolvida() {
        Pendencia pendencia = new Pendencia(null, null, Pendencia.Tipo.OUTRO, "descrição qualquer");
        assertNull(pendencia.getResolvidaEm(), "recém-criada não deve ter data de resolução");

        pendencia.setStatus(Pendencia.Status.RESOLVIDA);

        assertNotNull(pendencia.getResolvidaEm(), "ao resolver, a data de resolução deve ser preenchida");
    }

    @Test
    void resolvidaEm_deve_ser_limpa_ao_reabrir_pendencia() {
        Pendencia pendencia = new Pendencia(null, null, Pendencia.Tipo.OUTRO, "descrição qualquer");
        pendencia.setStatus(Pendencia.Status.RESOLVIDA);

        pendencia.setStatus(Pendencia.Status.EM_ANALISE);

        assertNull(pendencia.getResolvidaEm(), "ao reabrir, a data de resolução deve voltar a ser nula");
    }
}
