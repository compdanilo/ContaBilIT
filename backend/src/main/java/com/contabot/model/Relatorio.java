package com.contabot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "relatorios")
public class Relatorio {

    public enum Status {
        GERADO, EM_REVISAO, VALIDADO, DEVOLVIDO, FINALIZADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "competencia_id", nullable = false, unique = true)
    private Competencia competencia;

    @Column(nullable = false)
    private LocalDateTime geradoEm = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.GERADO;

    @Column(length = 2000)
    private String observacoes;

    public Relatorio() {}

    public Relatorio(Competencia competencia) {
        this.competencia = competencia;
        this.geradoEm = LocalDateTime.now();
        this.status = Status.GERADO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Competencia getCompetencia() { return competencia; }
    public void setCompetencia(Competencia competencia) { this.competencia = competencia; }
    public LocalDateTime getGeradoEm() { return geradoEm; }
    public void setGeradoEm(LocalDateTime geradoEm) { this.geradoEm = geradoEm; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
}
