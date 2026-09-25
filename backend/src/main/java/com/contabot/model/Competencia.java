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
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Representa o período contábil (ano/mês) de um cliente: o "guarda-chuva" que
 * agrupa documentos, lançamentos, pendências e o relatório daquele mês.
 */
@Entity
@Table(name = "competencia", uniqueConstraints = @UniqueConstraint(columnNames = {"cliente_id", "ano", "mes"}))
public class Competencia {

    public enum Status {
        ABERTA, EM_PROCESSAMENTO, AGUARDANDO_VALIDACAO, PENDENTE, VALIDADA, ENCERRADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Cliente cliente;

    @Column(nullable = false)
    private int ano;

    @Column(nullable = false)
    private int mes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Status status = Status.ABERTA;

    @Column(nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();

    private LocalDateTime fechadaEm;

    protected Competencia() {
        // JPA
    }

    public Competencia(Cliente cliente, int ano, int mes) {
        this.cliente = cliente;
        this.ano = ano;
        this.mes = mes;
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public int getAno() {
        return ano;
    }

    public int getMes() {
        return mes;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public LocalDateTime getFechadaEm() {
        return fechadaEm;
    }

    public void setFechadaEm(LocalDateTime fechadaEm) {
        this.fechadaEm = fechadaEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Competencia other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
