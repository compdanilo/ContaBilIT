import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente, Competencia, CompetenciaDetalhe, DashboardResumo } from '../../core/models';

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  template: `
    <div class="page" *ngIf="auth.ehContadorOuAdmin(); else painelCliente">
      <div class="section-head">
        <div>
          <h2>Painel Contábil TI</h2>
          <p>Acompanhamento fiscal, apuração de Fator R e rotinas mensais dos seus clientes de tecnologia.</p>
        </div>
      </div>
      <div class="cards">
        <article><span>Clientes TI</span><strong>{{ resumo?.clientes ?? 0 }}</strong><em>cadastrados</em></article>
        <article><span>Aguardando revisão</span><strong>{{ resumo?.competenciasAguardandoValidacao ?? 0 }}</strong><em>competências</em></article>
        <article><span>Validadas</span><strong>{{ resumo?.competenciasValidadas ?? 0 }}</strong><em>competências</em></article>
        <article><span>Com pendências</span><strong>{{ resumo?.competenciasComPendencias ?? 0 }}</strong><em>competências</em></article>
      </div>
      <div class="cards">
        <article><span>Documentos fiscais</span><strong>{{ resumo?.totalDocumentos ?? 0 }}</strong><em>recebidos no total</em></article>
        <article><span>Pendências abertas</span><strong>{{ resumo?.pendenciasAbertas ?? 0 }}</strong><em>a resolver</em></article>
        <article><span>Receitas Tech</span><strong>{{ resumo?.receitas | currency:'BRL' }}</strong><em>consolidado PJ</em></article>
        <article><span>Despesas operacionais</span><strong>{{ resumo?.despesas | currency:'BRL' }}</strong><em>consolidado</em></article>
      </div>
      <div class="quick">
        <a routerLink="/competencias">+ Nova competência</a>
        <a routerLink="/documentos">↑ Enviar NFS-e / Invoices</a>
        <a routerLink="/clientes">+ Cadastrar cliente TI</a>
      </div>

      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <h3>Competências de TI aguardando revisão</h3>
        <table>
          <thead><tr><th>Cliente PJ / Dev</th><th>Competência</th><th>Documentos</th><th>Pendências</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of aguardandoRevisao">
              <td>{{ c.cliente.nome }}</td>
              <td>{{ mes(c.mes) }}/{{ c.ano }}</td>
              <td>{{ c.documentosValidados }}/{{ c.totalDocumentos }}</td>
              <td>{{ c.pendenciasAbertas }}</td>
              <td><a [routerLink]="['/competencias', c.id]">Ver competência</a></td>
            </tr>
            <tr *ngIf="!aguardandoRevisao.length"><td colspan="5">Nenhuma competência aguardando revisão no momento.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <ng-template #painelCliente>
      <div class="page">
        <div class="section-head">
          <div><h2>Olá, {{ auth.usuario()?.nome }}</h2><p>Resumo fiscal da sua PJ de TI: NFS-e, apuração de impostos e status contábil.</p></div>
        </div>
        <p class="danger" *ngIf="erro">{{ erro }}</p>
        <div *ngIf="minhaCompetencia as d">
          <div class="cards">
            <article><span>Competência atual</span><strong>{{ mes(d.competencia.mes) }}/{{ d.competencia.ano }}</strong><em>{{ rotuloStatus(d.competencia.status) }}</em></article>
            <article><span>Documentos</span><strong>{{ d.competencia.documentosValidados }}/{{ d.competencia.totalDocumentos }}</strong><em>validados</em></article>
            <article><span>Pendências</span><strong>{{ d.competencia.pendenciasAbertas }}</strong><em>a resolver</em></article>
            <article><span>Relatório</span><strong>{{ d.relatorio?.status ?? 'Não gerado' }}</strong><em>status atual</em></article>
          </div>
          <div class="quick">
            <a [routerLink]="['/competencias', d.competencia.id]">Ver competência completa</a>
            <a routerLink="/documentos">↑ Enviar documentos</a>
          </div>
        </div>

        <div class="panel" *ngIf="!minhaCompetencia && !erro">
          <p>Você ainda não possui nenhuma competência aberta. Fale com seu contador.</p>
        </div>
      </div>
    </ng-template>
  `,
})
export class DashboardComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);
  resumo?: DashboardResumo;
  aguardandoRevisao: Competencia[] = [];
  minhaCompetencia?: CompetenciaDetalhe;
  erro = '';

  ngOnInit(): void {
    if (this.auth.ehContadorOuAdmin()) {
      this.api.get<DashboardResumo>('/dashboard').subscribe({
        next: (r) => (this.resumo = r),
        error: (e) => (this.erro = e.message),
      });
      this.api.get<Competencia[]>('/competencias').subscribe({
        next: (lista) => (this.aguardandoRevisao = lista.filter((c) => c.status === 'AGUARDANDO_VALIDACAO').slice(0, 10)),
        error: (e) => (this.erro = e.message),
      });
    } else {
      this.api.get<CompetenciaDetalhe>('/competencias/minha-atual').subscribe({
        next: (d) => (this.minhaCompetencia = d),
        error: (e) => {
          if (e.status !== 400 && e.status !== 404) this.erro = e.message;
        },
      });
    }
  }

  mes(m: number): string {
    return MESES[m] ?? String(m);
  }

  rotuloStatus(s: string): string {
    const rotulos: Record<string, string> = {
      ABERTA: 'Aberta', EM_PROCESSAMENTO: 'Em processamento', AGUARDANDO_VALIDACAO: 'Aguardando validação',
      PENDENTE: 'Pendente', VALIDADA: 'Validada', ENCERRADA: 'Encerrada',
    };
    return rotulos[s] ?? s;
  }
}
