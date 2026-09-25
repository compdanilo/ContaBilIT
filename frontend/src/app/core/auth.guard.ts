import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Papel } from './models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.autenticado()) return true;
  return inject(Router).createUrlTree(['/login']);
};

/** Usada na rota /login: quem já está logado não deve ver o formulário de novo. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.autenticado()) return true;
  return inject(Router).createUrlTree(['/']);
};

/** Restringe uma rota a determinados papéis; quem não se qualifica volta para o dashboard. */
export function roleGuard(papeisPermitidos: Papel[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    if (!auth.autenticado()) return inject(Router).createUrlTree(['/login']);
    if (auth.papel() && papeisPermitidos.includes(auth.papel()!)) return true;
    return inject(Router).createUrlTree(['/']);
  };
}
