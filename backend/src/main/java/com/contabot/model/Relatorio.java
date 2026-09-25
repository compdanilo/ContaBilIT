package com.contabot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "relatorio")
public class Relatorio {

    public enum Status {
        GERADO, EM_REVISAO, VALIDADO, DEVOLVIDO, FINALIZADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private Competencia competencia;

    @Column(nullable = false)
    private LocalDateTime geradoEm = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.GERADO;

    @Column(length = 1000)
    private String observacoes;

    protected Relatorio() {
        // JPA
    }

    public Relatorio(Competencia competencia) {
        this.competencia = competencia;
    }

    public Long getId() {
        return id;
    }

    public Competencia getCompetencia() {
        return competencia;
    }

    public LocalDateTime getGeradoEm() {
        return geradoEm;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Relatorio other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
