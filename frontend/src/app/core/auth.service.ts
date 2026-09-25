import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse, Papel } from './models';

const CHAVE_STORAGE = 'contabilit.sessao';

interface Sessao {
  token: string;
  nome: string;
  email: string;
  papel: Papel;
  clienteId: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private sessaoSignal = signal<Sessao | null>(this.lerDoStorage());

  readonly usuario = computed(() => this.sessaoSignal());
  readonly autenticado = computed(() => this.sessaoSignal() !== null);
  readonly papel = computed(() => this.sessaoSignal()?.papel ?? null);
  readonly ehContadorOuAdmin = computed(() => this.papel() === 'ADMIN' || this.papel() === 'CONTADOR');

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', body).pipe(
      tap((resposta) => {
        const sessao: Sessao = {
          token: resposta.token, nome: resposta.nome, email: resposta.email,
          papel: resposta.papel, clienteId: resposta.clienteId,
        };
        this.sessaoSignal.set(sessao);
        try {
          localStorage.setItem(CHAVE_STORAGE, JSON.stringify(sessao));
        } catch {
          // armazenamento indisponível (ex.: modo privado); a sessão segue válida em memória
        }
      }),
    );
  }

  logout(): void {
    this.sessaoSignal.set(null);
    try {
      localStorage.removeItem(CHAVE_STORAGE);
    } catch {
      // ignora falha ao limpar storage
    }
    this.router.navigateByUrl('/login');
  }

  get token(): string | null {
    return this.sessaoSignal()?.token ?? null;
  }

  private lerDoStorage(): Sessao | null {
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      return bruto ? (JSON.parse(bruto) as Sessao) : null;
    } catch {
      return null;
    }
  }
}
