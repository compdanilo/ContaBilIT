import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, ClienteRequest, CnpjConsultaResponse, TipoCliente } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="section-head">
        <div>
          <h2>Clientes Tech & TI</h2>
          <p>Desenvolvedores, engenheiros de software, consultores e startups atendidos pelo ContabilIT.</p>
        </div>
      </div>

      <!-- Formulário de cadastro com integração BrasilAPI -->
      <div class="panel" style="margin-bottom: 22px; padding: 22px;">
        <h3 style="margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span>Cadastrar Novo Cliente</span>
          <span style="font-size: 11px; font-weight: normal; color: var(--brand); background: var(--brand-soft); padding: 4px 8px; border-radius: 6px;">
            ⚡ Integração com Receita Federal (BrasilAPI)
          </span>
        </h3>

        <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
          <input [(ngModel)]="cpfCnpj" placeholder="CNPJ (apenas números ou formatado)" style="min-width: 260px;" (keyup.enter)="consultarCnpj()">
          <button type="button" (click)="consultarCnpj()" [disabled]="consultandoCnpj || !cpfCnpj.trim()" style="background: var(--brand-soft); color: var(--brand-strong); border-color: var(--brand-border); font-weight: 600;">
            {{ consultandoCnpj ? '⏳ Consultando Receita...' : '🔍 Buscar CNPJ na Receita Federal' }}
          </button>
        </div>

        <div *ngIf="dadosCnpj" style="background: rgba(255, 245, 238, 0.85); border: 1px solid var(--brand-border); border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; font-size: 12px; line-height: 1.6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--brand-strong); font-size: 13px;">{{ dadosCnpj.razaoSocial }}</strong>
            <span class="tag" [class.red]="dadosCnpj.situacaoCadastral !== 'ATIVA'">{{ dadosCnpj.situacaoCadastral }}</span>
          </div>
          <div><strong>Nome Fantasia:</strong> {{ dadosCnpj.nomeFantasia || 'Não informado' }}</div>
          <div><strong>CNAE TI/Principal:</strong> {{ dadosCnpj.cnaeCodigo ? (dadosCnpj.cnaeCodigo + ' - ') : '' }}{{ dadosCnpj.cnaePrincipal }}</div>
          <div><strong>Localização:</strong> {{ dadosCnpj.municipio }} / {{ dadosCnpj.uf }} (CEP {{ dadosCnpj.cep }})</div>
          <div *ngIf="dadosCnpj.naturezaJuridica"><strong>Natureza Jurídica:</strong> {{ dadosCnpj.naturezaJuridica }}</div>
        </div>

        <div class="form-grid four">
          <input [(ngModel)]="nome" placeholder="Nome / Razão Social *">
          <input [(ngModel)]="cpfCnpj" placeholder="CPF / CNPJ">
          <input [(ngModel)]="email" placeholder="E-mail">
          <select [(ngModel)]="tipo">
            <option value="PESSOA_FISICA">Pessoa Física (Dev autônomo)</option>
            <option value="PESSOA_JURIDICA">Pessoa Jurídica (PJ TI / Startup)</option>
          </select>
          <button (click)="save()" [disabled]="salvando" style="background: var(--brand); color: #fff;">
            {{ salvando ? 'Salvando...' : 'Adicionar cliente' }}
          </button>
        </div>
      </div>

      <p class="danger" *ngIf="erro">{{ erro }}</p>

      <div class="panel">
        <h3 style="margin-bottom: 16px;">Clientes Cadastrados ({{ clientes.length }})</h3>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Tipo</th>
              <th>E-mail</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clientes">
              <td><strong>{{ c.nome }}</strong></td>
              <td><code>{{ c.cpfCnpj || '—' }}</code></td>
              <td>
                <span class="tag" [style.background]="c.tipo === 'PESSOA_JURIDICA' ? '#eaf2f8' : '#f4eee9'" [style.color]="c.tipo === 'PESSOA_JURIDICA' ? '#1b5e90' : '#734626'">
                  {{ c.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF' }}
                </span>
              </td>
              <td>{{ c.email || '—' }}</td>
              <td><span class="tag" [class.red]="!c.ativo">{{ c.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td><button class="danger" (click)="remove(c.id)">Excluir</button></td>
            </tr>
            <tr *ngIf="!clientes.length">
              <td colspan="6" style="text-align: center; color: var(--muted); padding: 24px;">Nenhum cliente cadastrado ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ClientesComponent {
  private api = inject(ApiService);
  clientes: Cliente[] = [];
  nome = '';
  cpfCnpj = '';
  email = '';
  tipo: TipoCliente = 'PESSOA_FISICA';
  erro = '';
  salvando = false;
  consultandoCnpj = false;
  dadosCnpj: CnpjConsultaResponse | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<Cliente[]>('/clientes').subscribe({
      next: (c) => (this.clientes = c),
      error: (e) => (this.erro = e.message),
    });
  }

  consultarCnpj(): void {
    const raw = this.cpfCnpj.replace(/\D/g, '');
    if (!raw || raw.length < 14) {
      this.erro = 'Informe um CNPJ válido com 14 dígitos para consultar na Receita Federal.';
      return;
    }
    this.consultandoCnpj = true;
    this.erro = '';
    this.api.get<CnpjConsultaResponse>('/integracoes/cnpj/' + raw).subscribe({
      next: (res) => {
        this.consultandoCnpj = false;
        this.dadosCnpj = res;
        this.nome = res.razaoSocial || res.nomeFantasia;
        this.cpfCnpj = res.cnpj;
        if (res.email) this.email = res.email.toLowerCase();
        this.tipo = 'PESSOA_JURIDICA';
      },
      error: (err) => {
        this.consultandoCnpj = false;
        this.erro = 'Erro ao consultar CNPJ na BrasilAPI: ' + (err.error?.message || err.message || 'Verifique o número informado.');
      },
    });
  }

  save(): void {
    const nome = this.nome.trim();
    if (!nome) {
      this.erro = 'O nome ou razão social é obrigatório.';
      return;
    }
    const body: ClienteRequest = { nome, cpfCnpj: this.cpfCnpj.trim(), email: this.email.trim(), tipo: this.tipo, ativo: true };
    this.salvando = true;
    this.erro = '';
    this.api.post<Cliente>('/clientes', body).subscribe({
      next: () => {
        this.nome = this.cpfCnpj = this.email = '';
        this.dadosCnpj = null;
        this.salvando = false;
        this.load();
      },
      error: (e) => {
        this.erro = e.message;
        this.salvando = false;
      },
    });
  }

  remove(id: number): void {
    if (!confirm('Deseja realmente excluir este cliente?')) return;
    this.api.delete('/clientes/' + id).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }
}
