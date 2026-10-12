package com.contabot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "competencias", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cliente_id", "ano", "mes"})
})
public class Competencia {

    public enum Status {
        ABERTA, EM_PROCESSAMENTO, AGUARDANDO_VALIDACAO, PENDENTE, VALIDADA, ENCERRADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ABERTA;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    private LocalDateTime fechadaEm;

    public Competencia() {}

    public Competencia(Cliente cliente, int ano, int mes) {
        this.cliente = cliente;
        this.ano = ano;
        this.mes = mes;
        this.status = Status.ABERTA;
        this.criadaEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public int getAno() { return ano; }
    public void setAno(int ano) { this.ano = ano; }
    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCriadaEm() { return criadaEm; }
    public void setCriadaEm(LocalDateTime criadaEm) { this.criadaEm = criadaEm; }
    public LocalDateTime getFechadaEm() { return fechadaEm; }
    public void setFechadaEm(LocalDateTime fechadaEm) { this.fechadaEm = fechadaEm; }
}
