package com.contabot.repository;

import com.contabot.model.Pendencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendenciaRepository extends JpaRepository<Pendencia, Long> {
    List<Pendencia> findByCompetenciaId(Long competenciaId);
    List<Pendencia> findByStatus(Pendencia.Status status);
}
