import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app" *ngIf="auth.autenticado(); else semSessao">
      <aside>
        <div class="brand">
          <span class="mark">C</span>
          <div><b>ContabilIT</b><small>Facilite sua vida contábil.</small></div>
        </div>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">⌂ <span>Dashboard</span></a>
          <a *ngIf="auth.ehContadorOuAdmin()" routerLink="/clientes" routerLinkActive="active">◉ <span>Clientes</span></a>
          <a *ngIf="auth.ehContadorOuAdmin()" routerLink="/competencias" routerLinkActive="active">▤ <span>Competências</span></a>
          <a routerLink="/documentos" routerLinkActive="active">□ <span>Documentos</span></a>
          <a routerLink="/pendencias" routerLinkActive="active">! <span>Pendências</span></a>
          <a routerLink="/relatorios" routerLinkActive="active">▣ <span>Relatórios</span></a>
          <a *ngIf="auth.papel() === 'ADMIN'" routerLink="/usuarios" routerLinkActive="active">⚙ <span>Usuários</span></a>
        </nav>
        <div class="side-foot">ContabilIT · BuritiT Solutions</div>
      </aside>
      <main>
        <header>
          <div><h1>ContabilIT</h1><p>Automação contábil com validação humana.</p></div>
          <div class="user-box">
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
    </div>
    <ng-template #semSessao><router-outlet /></ng-template>
  `,
})
export class AppComponent {
  auth = inject(AuthService);

  rotuloPapel(papel: string | null): string {
    if (papel === 'ADMIN') return 'Administrador';
    if (papel === 'CONTADOR') return 'Contador';
    if (papel === 'CLIENTE') return 'Cliente';
    return '';
  }
}
