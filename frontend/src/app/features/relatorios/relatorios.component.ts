import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Relatorio } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Relatórios</h2><p>Consolidação de cada competência, pronta para revisão do contador.</p></div>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Competência</th><th>Gerado em</th><th>Status</th><th>Receitas</th><th>Despesas</th><th>Saldo</th><th>Pendências</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of relatorios">
              <td>#{{ r.competenciaId }}</td>
              <td>{{ r.geradoEm | date:'dd/MM/yyyy' }}</td>
              <td><span class="tag" [class.red]="r.status === 'DEVOLVIDO'" [class.yellow]="r.status === 'EM_REVISAO' || r.status === 'GERADO'">{{ r.status }}</span></td>
              <td>{{ r.receitas | currency:'BRL' }}</td>
              <td>{{ r.despesas | currency:'BRL' }}</td>
              <td>{{ r.saldo | currency:'BRL' }}</td>
              <td>{{ r.pendenciasAbertas }}</td>
              <td><a [routerLink]="['/competencias', r.competenciaId]">Abrir competência</a></td>
            </tr>
            <tr *ngIf="!relatorios.length"><td colspan="8">Nenhum relatório gerado ainda. Gere um a partir de uma competência.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RelatoriosComponent {
  private api = inject(ApiService);
  relatorios: Relatorio[] = [];
  erro = '';

  ngOnInit(): void {
    this.api.get<Relatorio[]>('/relatorios').subscribe({
      next: (r) => (this.relatorios = r),
      error: (e) => (this.erro = e.message),
    });
  }
}
