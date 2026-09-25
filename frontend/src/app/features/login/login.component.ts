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
          <div><b>ContabilIT</b><small>Facilite sua vida contábil.</small></div>
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
    .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f6f9}
    .login-card{background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(16,24,40,.08);padding:32px;width:320px;display:flex;flex-direction:column;gap:10px}
    .login-card .brand{display:flex;align-items:center;gap:10px;margin-bottom:14px}
    .login-card .mark{width:36px;height:36px;border-radius:10px;background:#2453ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
    .login-card b{display:block;font-size:15px}
    .login-card small{color:#778292;font-size:11px}
    .login-card label{font-size:11px;color:#5b6472;margin-top:6px}
    .login-card input{border:1px solid #d9dfe6;border-radius:8px;padding:10px 12px;font-size:13px}
    .login-card button{margin-top:14px;background:#111827;color:#fff;border:0;border-radius:8px;padding:11px;font-size:13px;cursor:pointer}
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
