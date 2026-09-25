import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { CompetenciasComponent } from './features/competencias/competencias.component';
import { CompetenciaDetalheComponent } from './features/competencias/competencia-detalhe.component';
import { DocumentosComponent } from './features/documentos/documentos.component';
import { PendenciasComponent } from './features/pendencias/pendencias.component';
import { RelatoriosComponent } from './features/relatorios/relatorios.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard, guestGuard, roleGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [roleGuard(['ADMIN', 'CONTADOR'])] },
  { path: 'competencias', component: CompetenciasComponent, canActivate: [roleGuard(['ADMIN', 'CONTADOR'])] },
  { path: 'competencias/:id', component: CompetenciaDetalheComponent, canActivate: [authGuard] },
  { path: 'documentos', component: DocumentosComponent, canActivate: [authGuard] },
  { path: 'pendencias', component: PendenciasComponent, canActivate: [authGuard] },
  { path: 'relatorios', component: RelatoriosComponent, canActivate: [authGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [roleGuard(['ADMIN'])] },
  { path: '**', redirectTo: '' },
];
