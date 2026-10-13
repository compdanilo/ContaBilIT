import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { TourModalComponent } from './features/tour/tour-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TourModalComponent],
  template: `
    <div class="app" *ngIf="auth.autenticado(); else semSessao">
      <aside>
        <div class="brand">
          <span class="mark">C</span>
          <div><b>ContabilIT</b><small>Contabilidade para TI & Devs</small></div>
        </div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">⌂ <span>Dashboard</span></a>
          <a *ngIf="auth.ehContadorOuAdmin()" routerLink="/clientes" routerLinkActive="active">◉ <span>Clientes TI</span></a>
          <a *ngIf="auth.ehContadorOuAdmin()" routerLink="/competencias" routerLinkActive="active">▤ <span>Competências</span></a>
          <a routerLink="/documentos" routerLinkActive="active">□ <span>Documentos TI</span></a>
          <a routerLink="/pendencias" routerLinkActive="active">! <span>Pendências</span></a>
          <a routerLink="/relatorios" routerLinkActive="active">▣ <span>Relatórios</span></a>
          <a *ngIf="auth.papel() === 'ADMIN'" routerLink="/usuarios" routerLinkActive="active">⚙ <span>Usuários</span></a>
        </nav>
        <div class="side-foot">ContabilIT · Contabilidade PJ & Devs</div>
      </aside>
      <main>
        <header>
          <div><h1>ContabilIT</h1><p>Contabilidade digital especializada em profissionais, devs e consultorias de TI.</p></div>
          <div class="user-box">
            <button class="btn-tour-nav" (click)="abrirTour = true" title="Ver Apresentação Guiada">
              ✨ Tour do Sistema
            </button>
            <div class="avatar">{{ auth.usuario()?.nome?.charAt(0) ?? '?' }}</div>
            <div class="user-info">
              <b>{{ auth.usuario()?.nome }}</b>
              <small>{{ rotuloPapel(auth.papel()) }}</small>
            </div>
            <button class="danger" (click)="auth.logout()">Sair</button>
          </div>
        </header>
        <section class="content"><router-outlet /></section>
      </main>

      <!-- Modal de Apresentação / Tour -->
      <app-tour-modal *ngIf="abrirTour" (fechar)="abrirTour = false" />
    </div>
    <ng-template #semSessao><router-outlet /></ng-template>
  `,
  styles: [`
    .btn-tour-nav {
      background: #fff4e9;
      border: 1px solid #f0c6ad;
      color: #81391f;
      border-radius: 20px;
      padding: 6px 13px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .btn-tour-nav:hover {
      background: #ffe8d6;
      border-color: #d98b62;
      transform: translateY(-1px);
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
  abrirTour = false;

  rotuloPapel(papel: string | null): string {
    if (papel === 'ADMIN') return 'Administrador';
    if (papel === 'CONTADOR') return 'Contador';
    if (papel === 'CLIENTE') return 'Cliente';
    return '';
  }
}
