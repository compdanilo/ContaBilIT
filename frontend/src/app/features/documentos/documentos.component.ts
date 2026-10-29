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

      <!-- Análise e Cadastro Rápido com IA -->
      <div class="panel" style="margin-bottom: 20px; padding: 20px; background: rgba(255, 252, 248, 0.96);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🤖 Assistente de IA para Documentos Fiscais</span>
            <span style="font-size: 10px; background: var(--brand-soft); color: var(--brand-strong); padding: 2px 8px; border-radius: 6px;">Gemini 3.8 Flash</span>
          </h3>
          <span style="font-size: 11px; color: var(--muted);">Extração automática de NFS-e, Invoices e Comprovantes</span>
        </div>
        <p style="font-size: 12px; color: var(--muted); margin: 0 0 12px;">
          Cole os dados ou texto da nota fiscal / invoice / recibo (ex: número, valor, tomador ou descrição do serviço de TI) para a IA classificar e registrar automaticamente:
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
          <textarea [(ngModel)]="textoDocumentoIa" placeholder="Cole aqui o texto da NFS-e, invoice internacional (Deel/Wise) ou fatura..." rows="2" style="flex: 1; min-width: 280px;"></textarea>
          <button type="button" (click)="analisarDocumentoIa()" [disabled]="analisandoIa || !textoDocumentoIa.trim() || !competenciaId" style="background: var(--brand); color: #fff; font-weight: 600; padding: 0 16px;">
            {{ analisandoIa ? '⏳ Analisando com IA...' : '✨ Analisar e Extrair com IA' }}
          </button>
        </div>

        <div *ngIf="resultadoIa" style="background: rgba(255, 245, 238, 0.9); border: 1px solid var(--brand-border); border-radius: 8px; padding: 12px 16px; font-size: 12px; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--brand-strong); font-size: 13px;">{{ resultadoIa.identificador }} ({{ resultadoIa.tipo }})</strong>
            <span class="tag">{{ resultadoIa.valor ? (resultadoIa.valor | currency:'BRL') : 'A calcular' }}</span>
          </div>
          <div><strong>Contraparte / Tomador:</strong> {{ resultadoIa.razaoSocialContraparte }}</div>
          <div><strong>CNAE de TI Sugerido:</strong> {{ resultadoIa.cnaeSugerido }}</div>
          <div><strong>Resumo Contábil:</strong> {{ resultadoIa.resumoContabil }}</div>
          <div style="margin-top: 10px;">
            <button type="button" (click)="salvarDocumentoIa()" [disabled]="salvandoIa" style="background: #267346; color: white; border: none; font-weight: 600;">
              {{ salvandoIa ? 'Salvando...' : '✔ Confirmar e Vincular à Competência' }}
            </button>
          </div>
        </div>
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
        <h3>Envie os documentos fiscais em arquivo (PDF, XML, Imagem)</h3>
        <p>NFS-e de software (CNAE 6201/6202), Invoices de contratos internacionais (Deel, Wise), DAS Simples Nacional e faturas de cloud/SaaS.</p>
        <input #fileInput type="file" multiple [disabled]="!clienteId || !competenciaId" (change)="upload(fileInput)">
        <span *ngIf="loading">Processando e extraindo dados...</span>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Arquivo / Identificador</th><th>Cliente</th><th>Tipo</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let d of docs">
              <td><strong>{{ d.nomeArquivo }}</strong></td>
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
  textoDocumentoIa = '';
  analisandoIa = false;
  salvandoIa = false;
  resultadoIa: any = null;
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

  analisarDocumentoIa(): void {
    if (!this.textoDocumentoIa.trim()) return;
    this.analisandoIa = true;
    this.erro = '';
    this.api.post<any>('/ia/analisar-documento', { texto: this.textoDocumentoIa.trim() }).subscribe({
      next: (res) => {
        this.analisandoIa = false;
        this.resultadoIa = res;
      },
      error: (e) => {
        this.analisandoIa = false;
        this.erro = 'Erro ao analisar com IA: ' + e.message;
      },
    });
  }

  salvarDocumentoIa(): void {
    if (!this.resultadoIa || !this.clienteId || !this.competenciaId) return;
    this.salvandoIa = true;
    this.erro = '';
    const nome = `${this.resultadoIa.identificador || 'DOC'}_${this.resultadoIa.tipo}.txt`;
    const conteudo = `${this.resultadoIa.identificador}\nTipo: ${this.resultadoIa.tipo}\nValor: ${this.resultadoIa.valor || ''}\nContraparte: ${this.resultadoIa.razaoSocialContraparte || ''}\nCNAE: ${this.resultadoIa.cnaeSugerido || ''}\nResumo: ${this.resultadoIa.resumoContabil || ''}\n\nTexto Original:\n${this.textoDocumentoIa}`;
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const file = new File([blob], nome, { type: 'text/plain' });

    const formData = new FormData();
    formData.append('files', file);

    const path = `/documentos/upload?clienteId=${this.clienteId}&competenciaId=${this.competenciaId}`;
    this.api.post<Documento[]>(path, formData).subscribe({
      next: () => {
        this.salvandoIa = false;
        this.resultadoIa = null;
        this.textoDocumentoIa = '';
        this.load();
      },
      error: (e) => {
        this.salvandoIa = false;
        this.erro = 'Erro ao salvar documento extraído: ' + e.message;
      },
    });
  }
}
