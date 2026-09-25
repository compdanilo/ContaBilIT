package com.contabot.repository;

import com.contabot.model.Competencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompetenciaRepository extends JpaRepository<Competencia, Long> {
    List<Competencia> findByClienteId(Long clienteId);
    Optional<Competencia> findByClienteIdAndAnoAndMes(Long clienteId, int ano, int mes);
}
