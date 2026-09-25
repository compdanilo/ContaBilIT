package com.contabot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "pendencia")
public class Pendencia {

    public enum Tipo {
        DOCUMENTO_AUSENTE, DOCUMENTO_INCONSISTENTE, COMPETENCIA_INCORRETA,
        DADO_INVALIDO, DOCUMENTO_DUPLICADO, INFORMACAO_NECESSARIA, OUTRO
    }

    public enum Status {
        ABERTA, EM_ANALISE, RESOLVIDA, CANCELADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Competencia competencia;

    @ManyToOne(fetch = FetchType.LAZY)
    private Documento documento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Tipo tipo;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.ABERTA;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    private LocalDateTime resolvidaEm;

    protected Pendencia() {
        // JPA
    }

    public Pendencia(Competencia competencia, Documento documento, Tipo tipo, String descricao) {
        this.competencia = competencia;
        this.documento = documento;
        this.tipo = tipo;
        this.descricao = descricao;
    }

    public Long getId() {
        return id;
    }

    public Competencia getCompetencia() {
        return competencia;
    }

    public Documento getDocumento() {
        return documento;
    }

    public Tipo getTipo() {
        return tipo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
        this.resolvidaEm = (status == Status.RESOLVIDA || status == Status.CANCELADA) ? LocalDateTime.now() : null;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public LocalDateTime getResolvidaEm() {
        return resolvidaEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Pendencia other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
