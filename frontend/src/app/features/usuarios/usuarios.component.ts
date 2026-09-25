import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cliente, Papel, Usuario, UsuarioRequest } from '../../core/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="section-head">
        <div><h2>Usuários</h2><p>Logins de acesso ao ContabilIT — quem é contador e quem é cliente.</p></div>
      </div>
      <div class="form-grid four">
        <input [(ngModel)]="nome" placeholder="Nome">
        <input [(ngModel)]="email" placeholder="E-mail de login">
        <input [(ngModel)]="senha" type="password" placeholder="Senha (mín. 6 caracteres)">
        <select [(ngModel)]="papel">
          <option value="CONTADOR">Contador</option>
          <option value="ADMIN">Admin</option>
          <option value="CLIENTE">Cliente</option>
        </select>
      </div>
      <div class="form-grid two" *ngIf="papel === 'CLIENTE'" style="margin-top:10px">
        <select [(ngModel)]="clienteId">
          <option [ngValue]="null" disabled>Vincular a qual cliente?</option>
          <option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nome }}</option>
        </select>
        <button (click)="criar()" [disabled]="salvando">Criar usuário</button>
      </div>
      <button *ngIf="papel !== 'CLIENTE'" (click)="criar()" [disabled]="salvando" style="margin-top:10px">Criar usuário</button>
      <p class="danger" *ngIf="erro">{{ erro }}</p>
      <div class="panel">
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Cliente vinculado</th></tr></thead>
          <tbody>
            <tr *ngFor="let u of usuarios">
              <td>{{ u.nome }}</td>
              <td>{{ u.email }}</td>
              <td><span class="tag">{{ u.papel }}</span></td>
              <td>{{ u.clienteId ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class UsuariosComponent {
  private api = inject(ApiService);
  usuarios: Usuario[] = [];
  clientes: Cliente[] = [];
  nome = '';
  email = '';
  senha = '';
  papel: Papel = 'CONTADOR';
  clienteId: number | null = null;
  erro = '';
  salvando = false;

  ngOnInit(): void {
    this.load();
    this.api.get<Cliente[]>('/clientes').subscribe({ next: (c) => (this.clientes = c) });
  }

  load(): void {
    this.api.get<Usuario[]>('/usuarios').subscribe({
      next: (u) => (this.usuarios = u),
      error: (e) => (this.erro = e.message),
    });
  }

  criar(): void {
    if (!this.nome.trim() || !this.email.trim() || this.senha.length < 6) {
      this.erro = 'Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.';
      return;
    }
    if (this.papel === 'CLIENTE' && !this.clienteId) {
      this.erro = 'Selecione a qual cliente este login pertence.';
      return;
    }
    const body: UsuarioRequest = {
      nome: this.nome.trim(), email: this.email.trim(), senha: this.senha,
      papel: this.papel, clienteId: this.papel === 'CLIENTE' ? this.clienteId! : undefined,
    };
    this.salvando = true;
    this.erro = '';
    this.api.post<Usuario>('/usuarios', body).subscribe({
      next: () => {
        this.nome = this.email = this.senha = '';
        this.clienteId = null;
        this.salvando = false;
        this.load();
      },
      error: (e) => {
        this.erro = e.message;
        this.salvando = false;
      },
    });
  }
}
