import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, ClienteRequest, TipoCliente } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Clientes Tech & TI</h2><p>Desenvolvedores, engenheiros de software, consultores e startups atendidos pelo ContabilIT.</p></div>
      </div>
      <div class="form-grid four">
        <input [(ngModel)]="nome" placeholder="Nome / razão social">
        <input [(ngModel)]="cpfCnpj" placeholder="CPF / CNPJ">
        <input [(ngModel)]="email" placeholder="E-mail">
        <select [(ngModel)]="tipo">
          <option value="PESSOA_FISICA">Pessoa física</option>
          <option value="PESSOA_JURIDICA">Pessoa jurídica</option>
        </select>
        <button (click)="save()" [disabled]="salvando">Adicionar cliente</button>
      </div>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Cliente</th><th>Documento</th><th>Tipo</th><th>E-mail</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let c of clientes">
              <td>{{ c.nome }}</td>
              <td>{{ c.cpfCnpj || '—' }}</td>
              <td>{{ c.tipo === 'PESSOA_JURIDICA' ? 'PJ' : 'PF' }}</td>
              <td>{{ c.email || '—' }}</td>
              <td><span class="tag" [class.red]="!c.ativo">{{ c.ativo ? 'Ativo' : 'Inativo' }}</span></td>
              <td><button class="danger" (click)="remove(c.id)">Excluir</button></td>
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

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.get<Cliente[]>('/clientes').subscribe({
      next: (c) => (this.clientes = c),
      error: (e) => (this.erro = e.message),
    });
  }

  save(): void {
    const nome = this.nome.trim();
    if (!nome) return;
    const body: ClienteRequest = { nome, cpfCnpj: this.cpfCnpj.trim(), email: this.email.trim(), tipo: this.tipo, ativo: true };
    this.salvando = true;
    this.erro = '';
    this.api.post<Cliente>('/clientes', body).subscribe({
      next: () => {
        this.nome = this.cpfCnpj = this.email = '';
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
    this.api.delete('/clientes/' + id).subscribe({
      next: () => this.load(),
      error: (e) => (this.erro = e.message),
    });
  }
}
