package com.contabot.repository;

import com.contabot.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    Optional<Relatorio> findByCompetenciaId(Long competenciaId);
}
