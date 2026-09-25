import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import {
  CompetenciaDetalhe, Documento, DocumentoAtualizacaoRequest, Lancamento, LancamentoRequest,
  Pendencia, Relatorio, StatusDocumento, TipoLancamento,
} from '../../core/models';

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page" *ngIf="detalhe as d">
      <div class="section-head">
        <div>
          <h2>{{ d.competencia.cliente.nome }} · {{ mes(d.competencia.mes) }}/{{ d.competencia.ano }}</h2>
          <p>Status atual: <span class="tag">{{ d.competencia.status }}</span></p>
        </div>
        <a routerLink="/competencias">← Voltar</a>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>

      <div class="panel">
        <h3>Documentos</h3>
        <table>
          <thead><tr><th>Arquivo</th><th>Tipo</th><th>Status</th><th>Observação</th><th>Ação</th></tr></thead>
          <tbody>
            <tr *ngFor="let doc of d.documentos">
              <td>{{ doc.nomeArquivo }}</td>
              <td>{{ doc.tipo }}</td>
              <td><span class="tag" [class.red]="doc.status === 'REJEITADO'" [class.yellow]="doc.status === 'PENDENTE' || doc.status === 'EM_ANALISE'">{{ doc.status }}</span></td>
              <td>{{ doc.observacao || '—' }}</td>
              <td class="acoes" *ngIf="auth.ehContadorOuAdmin()">
                <button (click)="validarDocumento(doc, 'VALIDADO')">Validar</button>
                <button class="danger" (click)="validarDocumento(doc, 'REJEITADO')">Rejeitar</button>
              </td>
            </tr>
            <tr *ngIf="!d.documentos.length"><td colspan="5">Nenhum documento enviado nesta competência.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h3>Lançamentos</h3>
        <div class="form-grid four">
          <select [(ngModel)]="novoTipo">
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
          <input [(ngModel)]="novaDescricao" placeholder="Descrição">
          <input type="number" min="0" step="0.01" [(ngModel)]="novoValor" placeholder="Valor">
          <input type="date" [(ngModel)]="novoVencimento">
          <button (click)="adicionarLancamento()" [disabled]="salvandoLancamento">Adicionar</button>
        </div>
        <table>
          <thead><tr><th>Tipo</th><th>Descrição</th><th>Valor</th><th>Vencimento</th></tr></thead>
          <tbody>
            <tr *ngFor="let l of d.lancamentos">
              <td><span class="tag" [class.red]="l.tipo === 'DESPESA'">{{ l.tipo }}</span></td>
              <td>{{ l.descricao }}</td>
              <td>{{ l.valor | currency:'BRL' }}</td>
              <td>{{ l.vencimento | date:'dd/MM/yyyy' }}</td>
            </tr>
            <tr *ngIf="!d.lancamentos.length"><td colspan="4">Nenhum lançamento nesta competência.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h3>Pendências</h3>
        <table>
          <thead><tr><th>Tipo</th><th>Descrição</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of d.pendencias">
              <td>{{ p.tipo }}</td>
              <td>{{ p.descricao }}</td>
              <td><span class="tag" [class.red]="p.status === 'ABERTA'">{{ p.status }}</span></td>
              <td>
                <button *ngIf="p.status !== 'RESOLVIDA' && auth.ehContadorOuAdmin()" (click)="resolverPendencia(p)">Marcar resolvida</button>
              </td>
            </tr>
            <tr *ngIf="!d.pendencias.length"><td colspan="4">Nenhuma pendência aberta. 🎉</td></tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h3>Relatório</h3>
        <div *ngIf="!d.relatorio">
          <p>Nenhum relatório gerado ainda para esta competência.</p>
          <button *ngIf="auth.ehContadorOuAdmin()" (click)="gerarRelatorio()">Gerar relatório</button>
        </div>
        <div *ngIf="d.relatorio as r">
          <div class="stats">
            <div><b>{{ r.receitas | currency:'BRL' }}</b><span>Receitas</span></div>
            <div><b>{{ r.despesas | currency:'BRL' }}</b><span>Despesas</span></div>
            <div><b>{{ r.saldo | currency:'BRL' }}</b><span>Saldo</span></div>
            <div><b>{{ r.documentosValidados }}/{{ r.totalDocumentos }}</b><span>Documentos validados</span></div>
            <div><b>{{ r.pendenciasAbertas }}</b><span>Pendências abertas</span></div>
          </div>
          <p>Status do relatório: <span class="tag">{{ r.status }}</span></p>
          <p *ngIf="r.observacoes">Observações: {{ r.observacoes }}</p>
          <div class="acoes" *ngIf="auth.ehContadorOuAdmin() && r.status !== 'VALIDADO' && r.status !== 'FINALIZADO'">
            <button (click)="validarRelatorio(r)">Validar</button>
            <button class="danger" (click)="mostrarDevolucao = !mostrarDevolucao">Devolver para correção</button>
          </div>
          <div class="form-grid" *ngIf="mostrarDevolucao">
            <input [(ngModel)]="observacaoDevolucao" placeholder="Motivo da devolução">
            <button class="danger" (click)="devolverRelatorio(r)" [disabled]="!observacaoDevolucao.trim()">Confirmar devolução</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CompetenciaDetalheComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  detalhe?: CompetenciaDetalhe;
  erro = '';

  novoTipo: TipoLancamento = 'RECEITA';
  novaDescricao = '';
  novoValor: number | null = null;
  novoVencimento = '';
  salvandoLancamento = false;

  mostrarDevolucao = false;
  observacaoDevolucao = '';

  ngOnInit(): void {
    this.load();
  }

  private get competenciaId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  load(): void {
    this.api.get<CompetenciaDetalhe>('/competencias/' + this.competenciaId).subscribe({
      next: (d) => (this.detalhe = d),
      error: (e) => (this.erro = e.message),
    });
  }

  mes(m: number): string {
    return MESES[m] ?? String(m);
  }

  validarDocumento(doc: Documento, status: StatusDocumento): void {
    const body: DocumentoAtualizacaoRequest = { status };
    this.api.put<Documento>('/documentos/' + doc.id, body).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }

  adicionarLancamento(): void {
    const descricao = this.novaDescricao.trim();
    if (!descricao || !this.novoValor || !this.novoVencimento) return;
    const body: LancamentoRequest = {
      competenciaId: this.competenciaId, tipo: this.novoTipo, descricao,
      valor: this.novoValor, vencimento: this.novoVencimento, pago: false,
    };
    this.salvandoLancamento = true;
    this.api.post<Lancamento>('/lancamentos', body).subscribe({
      next: () => {
        this.novaDescricao = '';
        this.novoValor = null;
        this.novoVencimento = '';
        this.salvandoLancamento = false;
        this.load();
      },
      error: (e) => {
        this.erro = e.message;
        this.salvandoLancamento = false;
      },
    });
  }

  resolverPendencia(p: Pendencia): void {
    this.api.put<Pendencia>('/pendencias/' + p.id + '/status', { status: 'RESOLVIDA' }).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }

  gerarRelatorio(): void {
    this.api.post<Relatorio>('/relatorios/competencias/' + this.competenciaId, {}).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }

  validarRelatorio(r: Relatorio): void {
    this.api.post<Relatorio>('/relatorios/' + r.id + '/validar', {}).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }

  devolverRelatorio(r: Relatorio): void {
    const body = { observacoes: this.observacaoDevolucao.trim(), criarPendencia: true, descricaoPendencia: this.observacaoDevolucao.trim() };
    this.api.post<Relatorio>('/relatorios/' + r.id + '/devolver', body).subscribe({
      next: () => {
        this.mostrarDevolucao = false;
        this.observacaoDevolucao = '';
        this.load();
      },
      error: (e) => (this.erro = e.message),
    });
  }
}
