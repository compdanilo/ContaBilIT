package com.contabot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pendencias")
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
    @JoinColumn(name = "competencia_id", nullable = false)
    private Competencia competencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id")
    private Documento documento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipo tipo;

    @Column(nullable = false, length = 1000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ABERTA;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    private LocalDateTime resolvidaEm;

    public Pendencia() {}

    public Pendencia(Competencia competencia, Documento documento, Tipo tipo, String descricao) {
        this.competencia = competencia;
        this.documento = documento;
        this.tipo = tipo;
        this.descricao = descricao;
        this.status = Status.ABERTA;
        this.criadaEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Competencia getCompetencia() { return competencia; }
    public void setCompetencia(Competencia competencia) { this.competencia = competencia; }
    public Documento getDocumento() { return documento; }
    public void setDocumento(Documento documento) { this.documento = documento; }
    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCriadaEm() { return criadaEm; }
    public void setCriadaEm(LocalDateTime criadaEm) { this.criadaEm = criadaEm; }
    public LocalDateTime getResolvidaEm() { return resolvidaEm; }
    public void setResolvidaEm(LocalDateTime resolvidaEm) { this.resolvidaEm = resolvidaEm; }
}
