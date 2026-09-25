package com.contabot.repository;

import com.contabot.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    List<Documento> findByCompetenciaId(Long competenciaId);
}
