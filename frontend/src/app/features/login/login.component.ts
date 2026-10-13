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
    .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9eee4 url('/assets/images/contabilit-background.png') center / cover fixed no-repeat}
    .login-card{background:rgba(255,253,250,.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(234,223,215,.95);border-radius:16px;box-shadow:0 8px 28px rgba(92,48,25,.09);padding:36px;width:350px;display:flex;flex-direction:column;gap:10px}
    .login-card .brand{display:flex;align-items:center;gap:12px;margin-bottom:16px}
    .login-card .mark{width:38px;height:38px;border-radius:11px;background:#fff4e9;color:#a94320;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;box-shadow:0 4px 12px #4c1e1530}
    .login-card b{display:block;font-size:16px;color:#593725;font-weight:700}
    .login-card small{color:#81746b;font-size:11px}
    .login-card label{font-size:12px;font-weight:600;color:#593725;margin-top:6px}
    .login-card input{border:1px solid #e3d4c9;border-radius:8px;padding:11px 12px;font-size:13px;color:#342820;outline:none;background:rgba(255,254,252,.98)}
    .login-card input:focus{border-color:#d98b62;box-shadow:0 0 0 3px rgba(198,93,46,.10)}
    .login-card button{margin-top:16px;background:#c65d2e;color:#FFFFFF;border:1px solid #c65d2e;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer;transition:background-color .18s ease;box-shadow:0 3px 8px #a9432018}
    .login-card button:hover:not(:disabled){background:#a94320}
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
