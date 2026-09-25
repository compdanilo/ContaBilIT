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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "documento")
public class Documento {

    public enum Tipo {
        NOTA_FISCAL, COMPROVANTE, RECIBO, DOCUMENTO_FISCAL, OUTRO
    }

    public enum Status {
        RECEBIDO, EM_ANALISE, VALIDADO, PENDENTE, REJEITADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Competencia competencia;

    @Column(nullable = false, length = 255)
    private String nomeArquivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Tipo tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Status status;

    private LocalDate dataDocumento;

    @Column(precision = 15, scale = 2)
    private BigDecimal valor;

    /** Ex.: número da nota fiscal, chave de acesso, CNPJ do emissor etc. */
    @Column(length = 100)
    private String identificador;

    @Column(nullable = false)
    private LocalDateTime enviadoEm;

    @Column(length = 500)
    private String observacao;

    /** Caminho do arquivo no storage (disco); o banco guarda só a referência, nunca os bytes. */
    @Column(length = 500)
    private String caminhoArquivo;

    protected Documento() {
        // JPA
    }

    public Documento(Cliente cliente, Competencia competencia, String nomeArquivo, Tipo tipo, LocalDateTime enviadoEm) {
        this.cliente = cliente;
        this.competencia = competencia;
        this.nomeArquivo = nomeArquivo;
        this.tipo = tipo;
        this.status = Status.RECEBIDO;
        this.enviadoEm = enviadoEm;
    }

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public Competencia getCompetencia() {
        return competencia;
    }

    public String getNomeArquivo() {
        return nomeArquivo;
    }

    public Tipo getTipo() {
        return tipo;
    }

    public void setTipo(Tipo tipo) {
        this.tipo = tipo;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getDataDocumento() {
        return dataDocumento;
    }

    public void setDataDocumento(LocalDate dataDocumento) {
        this.dataDocumento = dataDocumento;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getIdentificador() {
        return identificador;
    }

    public void setIdentificador(String identificador) {
        this.identificador = identificador;
    }

    public LocalDateTime getEnviadoEm() {
        return enviadoEm;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getCaminhoArquivo() {
        return caminhoArquivo;
    }

    public void setCaminhoArquivo(String caminhoArquivo) {
        this.caminhoArquivo = caminhoArquivo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Documento other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
