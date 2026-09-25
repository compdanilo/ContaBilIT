import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Pendencia, StatusPendencia } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Pendências</h2><p>Itens que precisam de atenção antes da competência ser validada.</p></div>
      </div>
      <div class="form-grid one">
        <select [(ngModel)]="filtroStatus" (ngModelChange)="load()">
          <option [ngValue]="null">Todos os status</option>
          <option value="ABERTA">Aberta</option>
          <option value="EM_ANALISE">Em análise</option>
          <option value="RESOLVIDA">Resolvida</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Competência</th><th>Tipo</th><th>Descrição</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of pendencias">
              <td><a [routerLink]="['/competencias', p.competenciaId]">#{{ p.competenciaId }}</a></td>
              <td>{{ p.tipo }}</td>
              <td>{{ p.descricao }}</td>
              <td><span class="tag" [class.red]="p.status === 'ABERTA'" [class.yellow]="p.status === 'EM_ANALISE'">{{ p.status }}</span></td>
              <td>
                <button *ngIf="auth.ehContadorOuAdmin() && p.status !== 'RESOLVIDA' && p.status !== 'CANCELADA'" (click)="atualizar(p, 'RESOLVIDA')">Resolver</button>
              </td>
            </tr>
            <tr *ngIf="!pendencias.length"><td colspan="5">Nenhuma pendência encontrada.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class PendenciasComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);
  pendencias: Pendencia[] = [];
  filtroStatus: StatusPendencia | null = null;
  erro = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const query = this.filtroStatus ? '?status=' + this.filtroStatus : '';
    this.api.get<Pendencia[]>('/pendencias' + query).subscribe({
      next: (p) => (this.pendencias = p),
      error: (e) => (this.erro = e.message),
    });
  }

  atualizar(p: Pendencia, status: StatusPendencia): void {
    this.api.put<Pendencia>('/pendencias/' + p.id + '/status', { status }).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }
}
