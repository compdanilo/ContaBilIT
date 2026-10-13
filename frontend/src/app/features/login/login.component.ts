import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { TourModalComponent } from '../tour/tour-modal.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, TourModalComponent],
  template: `
    <div class="login-wrapper">
      <!-- Header sutil com status da plataforma e botão de tour -->
      <header class="login-header">
        <div class="header-brand">
          <span class="header-mark">C</span>
          <span class="header-title">ContaBilIT</span>
        </div>
        <div class="header-actions">
          <button class="btn-tour-header" (click)="abrirTour = true">
            🎬 Tour Guiado do Sistema
          </button>
          <div class="header-badge">
            <span class="pulse-dot"></span>
            <span>Plataforma Online</span>
          </div>
        </div>
      </header>

      <!-- Container Central -->
      <main class="login-main">
        <div class="login-box">
          <!-- Cabeçalho do Card -->
          <div class="card-hero">
            <div class="brand-badge">
              <span class="mark">C</span>
              <div>
                <b>ContaBilIT</b>
                <small>Gestão Contábil para TI & Devs</small>
              </div>
            </div>
            <h2>Bem-vindo de volta</h2>
            <p>Acesse seu painel fiscal, envie NFS-e e acompanhe o Fator R da sua empresa de tecnologia.</p>
          </div>

          <!-- Formulário -->
          <form class="login-form" (ngSubmit)="entrar()">
            <div class="field-group">
              <label for="email">E-mail profissional</label>
              <div class="input-wrap">
                <span class="input-icon">✉</span>
                <input
                  id="email"
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  placeholder="seu.email@empresa.com.br"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <div class="field-group">
              <div class="label-row">
                <label for="senha">Senha</label>
                <button
                  type="button"
                  class="toggle-pass"
                  (click)="mostrarSenha = !mostrarSenha"
                  tabindex="-1"
                >
                  {{ mostrarSenha ? 'Ocultar' : 'Exibir' }}
                </button>
              </div>
              <div class="input-wrap">
                <span class="input-icon">🔒</span>
                <input
                  id="senha"
                  [(ngModel)]="senha"
                  name="senha"
                  [type]="mostrarSenha ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  required
                />
              </div>
            </div>

            <!-- Feedback de Erro -->
            <div class="error-banner" *ngIf="erro">
              <span>⚠</span>
              <p>{{ erro }}</p>
            </div>

            <!-- Botão de Login -->
            <button
              type="submit"
              class="btn-submit"
              [disabled]="entrando || !email || !senha"
            >
              <span *ngIf="!entrando">Acessar Sistema →</span>
              <span *ngIf="entrando" class="loading-state">
                <span class="spinner"></span>
                Autenticando...
              </span>
            </button>
          </form>

          <!-- Acesso Rápido para Demonstração -->
          <div class="demo-section">
            <div class="demo-header-row">
              <span class="demo-title">Acesso Rápido para Teste:</span>
              <button type="button" class="btn-text-tour" (click)="abrirTour = true">
                ✨ Ver Tour Guiado
              </button>
            </div>
            <div class="demo-chips">
              <button
                type="button"
                class="chip"
                (click)="preencher('cliente@empresa.com.br', 'cliente123')"
              >
                💻 Dev PJ (Cliente)
              </button>
              <button
                type="button"
                class="chip"
                (click)="preencher('contador@contabilit.com.br', 'contador123')"
              >
                📊 Contador
              </button>
              <button
                type="button"
                class="chip"
                (click)="preencher('admin@contabilit.com.br', 'admin123')"
              >
                ⚙ Admin
              </button>
            </div>
          </div>

          <!-- Rodapé do Card com Selo de Segurança -->
          <div class="card-footer">
            <span class="security-seal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Conexão protegida com autenticação JWT e isolamento fiscal
            </span>
          </div>
        </div>
      </main>

      <!-- Rodapé Oficial da Página -->
      <footer class="login-footer">
        <div class="footer-content">
          <p class="brand-sign">
            <strong>ContaBilIT</strong> <span class="at-sign">@</span> <strong>Buriti Solutions</strong>
          </p>
          <p class="copyright">
            Contabilidade digital especializada em profissionais e consultorias de TI · Todos os direitos reservados
          </p>
        </div>
      </footer>

      <!-- Modal de Demonstração / Tour Guiado -->
      <app-tour-modal
        *ngIf="abrirTour"
        (fechar)="abrirTour = false"
        (entrarPerfil)="entrarComPerfil($event)"
      />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      width: 100%;
    }

    .login-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #f9eee4 url('/assets/images/contabilit-background.png') center / cover fixed no-repeat;
      padding: 20px 24px;
      box-sizing: border-box;
      position: relative;
    }

    /* Header Superior */
    .login-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
      padding: 12px 16px;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: #c65d2e;
      color: #ffffff;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(169, 67, 32, 0.25);
    }

    .header-title {
      font-size: 17px;
      font-weight: 700;
      color: #593725;
      letter-spacing: -0.3px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-tour-header {
      background: rgba(255, 253, 250, 0.95);
      border: 1px solid #f0c6ad;
      color: #81391f;
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(92, 48, 25, 0.06);
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-tour-header:hover {
      background: #fff0e6;
      border-color: #d98b62;
      transform: translateY(-1px);
    }

    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 253, 250, 0.85);
      border: 1px solid rgba(234, 223, 215, 0.9);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      color: #267346;
      box-shadow: 0 2px 8px rgba(92, 48, 25, 0.04);
      backdrop-filter: blur(8px);
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #267346;
      box-shadow: 0 0 0 3px rgba(38, 115, 70, 0.2);
    }

    /* Container Central */
    .login-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 0;
    }

    .login-box {
      background: rgba(255, 253, 250, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(234, 223, 215, 0.95);
      border-radius: 20px;
      box-shadow: 0 16px 44px rgba(92, 48, 25, 0.11), 0 2px 6px rgba(92, 48, 25, 0.04);
      padding: 40px 42px;
      width: 100%;
      max-width: 440px;
      box-sizing: border-box;
      transition: transform 0.2s ease;
    }

    /* Hero do Card */
    .card-hero {
      margin-bottom: 24px;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .brand-badge .mark {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(145deg, #c65d2e, #a94320);
      color: #ffffff;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 6px 16px rgba(169, 67, 32, 0.28);
    }

    .brand-badge b {
      display: block;
      font-size: 18px;
      color: #593725;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .brand-badge small {
      display: block;
      color: #81746b;
      font-size: 11px;
      font-weight: 500;
    }

    .card-hero h2 {
      font-size: 24px;
      font-weight: 700;
      color: #342820;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }

    .card-hero p {
      font-size: 13px;
      color: #81746b;
      margin: 0;
      line-height: 1.5;
    }

    /* Formulário */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-group label {
      font-size: 12px;
      font-weight: 600;
      color: #49372d;
    }

    .toggle-pass {
      background: none;
      border: none;
      color: #c65d2e;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .toggle-pass:hover {
      color: #a94320;
      text-decoration: underline;
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      font-size: 14px;
      color: #81746b;
      pointer-events: none;
    }

    .input-wrap input {
      width: 100%;
      border: 1px solid #e3d4c9;
      border-radius: 10px;
      padding: 12px 14px 12px 42px;
      font-size: 13px;
      color: #342820;
      outline: none;
      background: rgba(255, 254, 252, 0.98);
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      box-sizing: border-box;
    }

    .input-wrap input:focus {
      border-color: #d98b62;
      box-shadow: 0 0 0 3px rgba(198, 93, 46, 0.12);
    }

    .input-wrap input::placeholder {
      color: #b0a49c;
    }

    /* Banner de Erro */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff0ee;
      border: 1px solid #f8c9c4;
      border-radius: 9px;
      padding: 10px 14px;
      color: #b42318;
      font-size: 12px;
    }

    .error-banner span {
      font-size: 15px;
      flex-shrink: 0;
    }

    .error-banner p {
      margin: 0;
      line-height: 1.4;
    }

    /* Botão Principal */
    .btn-submit {
      margin-top: 6px;
      background: linear-gradient(145deg, #c65d2e, #a94320);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(169, 67, 32, 0.25);
      transition: all 0.18s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(145deg, #ba5427, #993b1b);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(169, 67, 32, 0.32);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .loading-state {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Seção Demo */
    .demo-section {
      margin-top: 26px;
      padding-top: 20px;
      border-top: 1px dashed rgba(234, 223, 215, 0.95);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .demo-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .demo-title {
      font-size: 11px;
      font-weight: 600;
      color: #81746b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .btn-text-tour {
      background: none;
      border: none;
      color: #c65d2e;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s ease;
    }

    .btn-text-tour:hover {
      color: #a94320;
      text-decoration: underline;
    }

    .demo-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .chip {
      background: #fff4e9;
      border: 1px solid #f0c6ad;
      color: #74432e;
      border-radius: 8px;
      padding: 7px 11px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .chip:hover {
      background: #ffe8d6;
      border-color: #d98b62;
      color: #593725;
      transform: translateY(-1px);
    }

    /* Selo de Segurança */
    .card-footer {
      margin-top: 18px;
      text-align: center;
    }

    .security-seal {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #9c8e85;
      line-height: 1.4;
    }

    .security-seal svg {
      color: #267346;
      flex-shrink: 0;
    }

    /* Rodapé da Página */
    .login-footer {
      max-width: 1100px;
      width: 100%;
      margin: 0 auto;
      padding: 16px;
      text-align: center;
      box-sizing: border-box;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }

    .brand-sign {
      font-size: 13px;
      color: #593725;
      margin: 0;
      letter-spacing: -0.2px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-sign strong {
      font-weight: 700;
      color: #342820;
    }

    .brand-sign .at-sign {
      color: #c65d2e;
      font-weight: 700;
      font-size: 14px;
    }

    .copyright {
      font-size: 11px;
      color: #81746b;
      margin: 0;
      line-height: 1.4;
    }

    @media (max-width: 480px) {
      .login-box {
        padding: 28px 22px;
        border-radius: 16px;
      }
      .demo-chips {
        flex-direction: column;
      }
      .chip {
        text-align: left;
      }
      .login-header {
        flex-direction: column;
        gap: 10px;
      }
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  erro = '';
  entrando = false;
  mostrarSenha = false;
  abrirTour = false;

  preencher(email: string, pass: string): void {
    this.email = email;
    this.senha = pass;
    this.erro = '';
  }

  entrarComPerfil(papel: 'CLIENTE' | 'CONTADOR' | 'ADMIN'): void {
    this.abrirTour = false;
    if (papel === 'CLIENTE') {
      this.preencher('cliente@empresa.com.br', 'cliente123');
    } else if (papel === 'CONTADOR') {
      this.preencher('contador@contabilit.com.br', 'contador123');
    } else {
      this.preencher('admin@contabilit.com.br', 'admin123');
    }
    this.entrar();
  }

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
        this.erro = e.message ?? 'Não foi possível entrar. Verifique suas credenciais.';
      },
    });
  }
}
