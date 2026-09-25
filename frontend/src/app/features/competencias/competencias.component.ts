import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Cliente, Competencia, CompetenciaRequest } from '../../core/models';

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const ROTULOS_STATUS: Record<string, string> = {
  ABERTA: 'Aberta', EM_PROCESSAMENTO: 'Em processamento', AGUARDANDO_VALIDACAO: 'Aguardando validação',
  PENDENTE: 'Pendente', VALIDADA: 'Validada', ENCERRADA: 'Encerrada',
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Competências</h2><p>Cada linha é um período contábil (mês/ano) de um cliente.</p></div>
      </div>
      <div class="form-grid four">
        <select [(ngModel)]="clienteId">
          <option [ngValue]="null" disabled>Selecione o cliente</option>
          <option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nome }}</option>
        </select>
        <input type="number" min="2000" max="2100" [(ngModel)]="ano" placeholder="Ano">
        <select [(ngModel)]="mes">
          <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [ngValue]="m">{{ rotuloMes(m) }}</option>
        </select>
        <button (click)="criar()" [disabled]="salvando || !clienteId">Abrir competência</button>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Cliente</th><th>Competência</th><th>Status</th><th>Documentos</th><th>Pendências</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of competencias">
              <td>{{ c.cliente.nome }}</td>
              <td>{{ rotuloMes(c.mes) }}/{{ c.ano }}</td>
              <td><span class="tag" [class.red]="c.status === 'PENDENTE'" [class.yellow]="c.status === 'AGUARDANDO_VALIDACAO'">{{ rotuloStatus(c.status) }}</span></td>
              <td>{{ c.documentosValidados }}/{{ c.totalDocumentos }}</td>
              <td>{{ c.pendenciasAbertas }}</td>
              <td><a [routerLink]="['/competencias', c.id]">Abrir</a></td>
            </tr>
            <tr *ngIf="!competencias.length"><td colspan="6">Nenhuma competência cadastrada ainda.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CompetenciasComponent {
  private api = inject(ApiService);
  competencias: Competencia[] = [];
  clientes: Cliente[] = [];
  clienteId: number | null = null;
  ano = new Date().getFullYear();
  mes = new Date().getMonth() + 1;
  erro = '';
  salvando = false;

  ngOnInit(): void {
    this.load();
    this.api.get<Cliente[]>('/clientes').subscribe({ next: (c) => (this.clientes = c) });
  }

  load(): void {
    this.api.get<Competencia[]>('/competencias').subscribe({
      next: (c) => (this.competencias = c),
      error: (e) => (this.erro = e.message),
    });
  }

  criar(): void {
    if (!this.clienteId) return;
    const body: CompetenciaRequest = { clienteId: this.clienteId, ano: this.ano, mes: this.mes };
    this.salvando = true;
    this.erro = '';
    this.api.post<Competencia>('/competencias', body).subscribe({
      next: () => {
        this.salvando = false;
        this.load();
      },
      error: (e) => {
        this.erro = e.message;
        this.salvando = false;
      },
    });
  }

  rotuloMes(m: number): string {
    return MESES[m] ?? String(m);
  }

  rotuloStatus(s: string): string {
    return ROTULOS_STATUS[s] ?? s;
  }
}
