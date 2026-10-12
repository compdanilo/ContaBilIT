import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente, Competencia, Documento } from '../../core/models';

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Documentos Fiscais TI</h2><p>Envie NFS-e de desenvolvimento, Invoices de remessas internacionais, DAS e comprovantes de despesas de TI.</p></div>
      </div>
      <div class="upload" (dragover)="$event.preventDefault()">
        <div class="form-grid two" style="margin-bottom:16px">
          <select *ngIf="auth.ehContadorOuAdmin()" [(ngModel)]="clienteId" (ngModelChange)="carregarCompetencias()">
            <option [ngValue]="null" disabled>Selecione o cliente PJ</option>
            <option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nome }}</option>
          </select>
          <select [(ngModel)]="competenciaId">
            <option [ngValue]="null" disabled>Selecione a competência</option>
            <option *ngFor="let c of competencias" [ngValue]="c.id">{{ mes(c.mes) }}/{{ c.ano }}</option>
          </select>
        </div>
        <div class="upload-icon">↑</div>
        <h3>Envie os documentos fiscais da sua empresa de TI</h3>
        <p>NFS-e de software (CNAE 6201/6202), Invoices de contratos internacionais (Deel, Wise), DAS Simples Nacional e faturas de cloud/SaaS.</p>
        <input #fileInput type="file" multiple [disabled]="!clienteId || !competenciaId" (change)="upload(fileInput)">
        <span *ngIf="loading">Processando e extraindo dados...</span>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Arquivo</th><th>Cliente</th><th>Tipo</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of docs">
              <td>{{ d.nomeArquivo }}</td>
              <td>{{ d.clienteNome }}</td>
              <td>{{ d.tipo }}</td>
              <td><span class="tag" [class.red]="d.status === 'REJEITADO'" [class.yellow]="d.status === 'PENDENTE' || d.status === 'EM_ANALISE'">{{ d.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DocumentosComponent {
  private api = inject(ApiService);
  auth = inject(AuthService);
  docs: Documento[] = [];
  clientes: Cliente[] = [];
  competencias: Competencia[] = [];
  clienteId: number | null = null;
  competenciaId: number | null = null;
  loading = false;
  erro = '';

  ngOnInit(): void {
    this.load();
    if (this.auth.ehContadorOuAdmin()) {
      this.api.get<Cliente[]>('/clientes').subscribe({ next: (c) => (this.clientes = c) });
    } else {
      this.clienteId = this.auth.usuario()?.clienteId ?? null;
      this.carregarCompetencias();
    }
  }

  load(): void {
    this.api.get<Documento[]>('/documentos').subscribe({
      next: (d) => (this.docs = d),
      error: (e) => (this.erro = e.message),
    });
  }

  carregarCompetencias(): void {
    this.competenciaId = null;
    this.competencias = [];
    if (!this.clienteId) return;
    this.api.get<Competencia[]>('/competencias?clienteId=' + this.clienteId).subscribe({
      next: (c) => (this.competencias = c),
      error: (e) => (this.erro = e.message),
    });
  }

  mes(m: number): string {
    return MESES[m] ?? String(m);
  }

  upload(input: HTMLInputElement): void {
    const files = input.files;
    if (!files?.length || !this.clienteId || !this.competenciaId) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('files', f));
    this.loading = true;
    this.erro = '';
    const path = `/documentos/upload?clienteId=${this.clienteId}&competenciaId=${this.competenciaId}`;
    this.api.post<Documento[]>(path, formData).subscribe({
      next: () => {
        this.loading = false;
        input.value = '';
        this.load();
      },
      error: (e) => {
        this.loading = false;
        this.erro = e.message;
      },
    });
  }
}
