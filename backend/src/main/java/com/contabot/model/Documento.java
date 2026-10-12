package com.contabot.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    public enum Tipo {
        NOTA_FISCAL, RECIBO, COMPROVANTE, DOCUMENTO_FISCAL, OUTRO
    }

    public enum Status {
        RECEBIDO, EM_ANALISE, VALIDADO, PENDENTE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "competencia_id", nullable = false)
    private Competencia competencia;

    @Column(nullable = false)
    private String nomeArquivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Tipo tipo = Tipo.OUTRO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.RECEBIDO;

    private LocalDate dataDocumento;
    private BigDecimal valor;
    private String identificador;

    @Column(nullable = false)
    private LocalDateTime enviadoEm = LocalDateTime.now();

    @Column(length = 1000)
    private String observacao;

    private String caminhoArquivo;

    public Documento() {}

    public Documento(Cliente cliente, Competencia competencia, String nomeArquivo, Tipo tipo, LocalDateTime enviadoEm) {
        this.cliente = cliente;
        this.competencia = competencia;
        this.nomeArquivo = nomeArquivo;
        this.tipo = tipo;
        this.enviadoEm = enviadoEm;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Competencia getCompetencia() { return competencia; }
    public void setCompetencia(Competencia competencia) { this.competencia = competencia; }
    public String getNomeArquivo() { return nomeArquivo; }
    public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }
    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDate getDataDocumento() { return dataDocumento; }
    public void setDataDocumento(LocalDate dataDocumento) { this.dataDocumento = dataDocumento; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
    public String getIdentificador() { return identificador; }
    public void setIdentificador(String identificador) { this.identificador = identificador; }
    public LocalDateTime getEnviadoEm() { return enviadoEm; }
    public void setEnviadoEm(LocalDateTime enviadoEm) { this.enviadoEm = enviadoEm; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public String getCaminhoArquivo() { return caminhoArquivo; }
    public void setCaminhoArquivo(String caminhoArquivo) { this.caminhoArquivo = caminhoArquivo; }
}
