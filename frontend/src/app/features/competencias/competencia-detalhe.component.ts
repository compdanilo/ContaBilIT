import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import {
  CompetenciaDetalhe, Documento, DocumentoAtualizacaoRequest, IaParecerFiscal, IaSugestaoLancamento, Lancamento, LancamentoRequest,
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0;">Lançamentos Financeiros</h3>
          <span style="font-size: 11px; background: var(--brand-soft); color: var(--brand-strong); padding: 3px 8px; border-radius: 6px;">
            ✨ Assistente de IA Contábil
          </span>
        </div>

        <!-- Box de Autopreenchimento com IA -->
        <div style="background: rgba(255, 245, 238, 0.85); border: 1px dashed var(--brand-border); border-radius: 9px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--brand-strong); margin-bottom: 4px;">
            🤖 Autopreenchimento Inteligente por IA (Gemini 3.8 Flash)
          </div>
          <p style="font-size: 11px; color: var(--muted); margin: 0 0 10px;">
            Digite uma descrição livre (ex: <i>"Paguei US$ 150 na AWS no dia 10"</i>, <i>"Recebi R$ 14.000 da Deel por dev backend"</i> ou <i>"Pró-labore R$ 5.200"</i>) e a IA preencherá os campos fiscais:
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <input [(ngModel)]="iaPrompt" placeholder="Digite ou cole aqui a descrição do lançamento..." style="flex: 1; min-width: 260px;" (keyup.enter)="preencherComIa()">
            <button type="button" (click)="preencherComIa()" [disabled]="extraindoIa || !iaPrompt.trim()" style="background: var(--brand); color: #fff; font-weight: 600;">
              {{ extraindoIa ? '⏳ Analisando com IA...' : '✨ Preencher com IA' }}
            </button>
          </div>
          <div *ngIf="iaSugestaoInfo" style="margin-top: 8px; font-size: 11px; color: var(--brand-strong); background: #fff; border: 1px solid var(--brand-border); padding: 6px 10px; border-radius: 6px;">
            <strong>Classificação IA:</strong> {{ iaSugestaoInfo }}
          </div>
        </div>

        <div class="form-grid four">
          <select [(ngModel)]="novoTipo">
            <option value="RECEITA">Receita (NFS-e, Invoices)</option>
            <option value="DESPESA">Despesa (Cloud, Pró-labore, Ferramentas)</option>
          </select>
          <input [(ngModel)]="novaDescricao" placeholder="Descrição do lançamento">
          <input type="number" min="0" step="0.01" [(ngModel)]="novoValor" placeholder="Valor (R$)">
          <input type="date" [(ngModel)]="novoVencimento">
          <button (click)="adicionarLancamento()" [disabled]="salvandoLancamento" style="background: #593725; color: #fff;">
            {{ salvandoLancamento ? 'Salvando...' : 'Adicionar Lançamento' }}
          </button>
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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0;">Relatório de Fechamento</h3>
          <button *ngIf="auth.ehContadorOuAdmin() && d.relatorio" (click)="gerarParecerIa()" [disabled]="gerandoParecerIa" style="background: var(--brand-soft); color: var(--brand-strong); border-color: var(--brand-border); font-size: 11px; font-weight: 600;">
            {{ gerandoParecerIa ? '⏳ Auditando...' : '🤖 Gerar Parecer Fiscal com IA' }}
          </button>
        </div>
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
          <p style="margin-top: 14px;">Status do relatório: <span class="tag">{{ r.status }}</span></p>

          <div *ngIf="parecerIa" style="background: rgba(234, 246, 238, 0.9); border: 1px solid #b7dfca; border-radius: 9px; padding: 14px; margin: 14px 0; font-size: 12px; line-height: 1.5;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: #1b5e32; font-size: 13px;">📋 Parecer Fiscal IA — Fator R: {{ parecerIa.fatorRCalculado }}%</strong>
              <span class="tag" [class.red]="!parecerIa.aprovacaoRecomendada">{{ parecerIa.enquadramentoSugerido }}</span>
            </div>
            <p style="margin: 0 0 8px; color: #234d31;">{{ parecerIa.parecer }}</p>
            <div *ngIf="parecerIa.pontosAtencao?.length">
              <strong style="color: #234d31;">Pontos de Atenção:</strong>
              <ul style="margin: 4px 0 0; padding-left: 18px; color: #3b5f46;">
                <li *ngFor="let pt of parecerIa.pontosAtencao">{{ pt }}</li>
              </ul>
            </div>
          </div>

          <p *ngIf="r.observacoes && !parecerIa">Observações: {{ r.observacoes }}</p>
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

  iaPrompt = '';
  extraindoIa = false;
  iaSugestaoInfo = '';

  gerandoParecerIa = false;
  parecerIa?: IaParecerFiscal;

  mostrarDevolucao = false;
  observacaoDevolucao = '';

  preencherComIa(): void {
    const prompt = this.iaPrompt.trim();
    if (!prompt) return;
    this.extraindoIa = true;
    this.erro = '';
    this.api.post<IaSugestaoLancamento>('/ia/extrair-lancamento', { prompt }).subscribe({
      next: (res) => {
        this.extraindoIa = false;
        if (res) {
          this.novoTipo = res.tipo;
          this.novaDescricao = res.descricao;
          this.novoValor = res.valor;
          this.novoVencimento = res.vencimento;
          this.iaSugestaoInfo = `${res.categoria || 'TI'} ${res.impactaFatorR ? '• Compõe Fator R (28%)' : ''} — ${res.observacaoFiscal || ''}`;
        }
      },
      error: (e) => {
        this.extraindoIa = false;
        this.erro = 'Erro no assistente de IA: ' + e.message;
      },
    });
  }

  gerarParecerIa(): void {
    this.gerandoParecerIa = true;
    this.erro = '';
    this.api.post<IaParecerFiscal>('/ia/parecer-fiscal', { competenciaId: this.competenciaId }).subscribe({
      next: (res) => {
        this.gerandoParecerIa = false;
        this.parecerIa = res;
      },
      error: (e) => {
        this.gerandoParecerIa = false;
        this.erro = 'Erro ao gerar parecer com IA: ' + e.message;
      },
    });
  }

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
