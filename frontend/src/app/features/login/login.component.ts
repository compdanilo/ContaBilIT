import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <form class="login-card" (ngSubmit)="entrar()">
        <div class="brand">
          <span class="mark">C</span>
          <div><b>ContabilIT</b><small>Contabilidade para TI & Devs</small></div>
        </div>
        <label>E-mail</label>
        <input [(ngModel)]="email" name="email" type="email" autocomplete="username" required>
        <label>Senha</label>
        <input [(ngModel)]="senha" name="senha" type="password" autocomplete="current-password" required>
        <p class="danger" *ngIf="erro">{{ erro }}</p>
        <button type="submit" [disabled]="entrando || !email || !senha">{{ entrando ? 'Entrando...' : 'Entrar' }}</button>
      </form>
    </div>
  `,
  styles: [`
    .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background-color:#F8F9FA;background-image:url('/assets/images/bg_ondas_quentes.jpg');background-size:cover;background-position:center;background-repeat:no-repeat}
    .login-card{background:rgba(255,255,255,0.95);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(222,226,230,0.85);border-radius:16px;box-shadow:0 12px 36px rgba(107,59,49,0.12);padding:36px;width:350px;display:flex;flex-direction:column;gap:10px}
    .login-card .brand{display:flex;align-items:center;gap:12px;margin-bottom:16px}
    .login-card .mark{width:38px;height:38px;border-radius:10px;background:#6B3B31;color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px}
    .login-card b{display:block;font-size:16px;color:#6B3B31;font-weight:700}
    .login-card small{color:#6C757D;font-size:11px}
    .login-card label{font-size:12px;font-weight:600;color:#495057;margin-top:6px}
    .login-card input{border:1px solid #DEE2E6;border-radius:8px;padding:10px 12px;font-size:13px;color:#212529;outline:none;background:#FFFFFF}
    .login-card input:focus{border-color:#0066CC;box-shadow:0 0 0 3px rgba(0,102,204,.15)}
    .login-card button{margin-top:16px;background:#2EA44F;color:#FFFFFF;border:0;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background-color .15s ease}
    .login-card button:hover:not(:disabled){background:#268B42}
    .login-card button:disabled{opacity:.6;cursor:default}
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  erro = '';
  entrando = false;

  entrar(): void {
    this.entrando = true;
    this.erro = '';
    this.auth.login({ email: this.email.trim(), senha: this.senha }).subscribe({
      next: () => {
        this.entrando = false;
        this.router.navigateByUrl('/');
      },
      error: (e) => {
        this.entrando = false;
        this.erro = e.message ?? 'Não foi possível entrar.';
      },
    });
  }
}
