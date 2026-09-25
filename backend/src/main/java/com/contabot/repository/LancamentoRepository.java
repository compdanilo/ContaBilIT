package com.contabot.repository;

import com.contabot.model.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {
    List<Lancamento> findByCompetenciaId(Long competenciaId);
}
