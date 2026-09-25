import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

/** Mensagem de erro amigável já extraída da resposta da API. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.base + path).pipe(catchError(this.toApiError));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.base + path, body).pipe(catchError(this.toApiError));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.base + path, body).pipe(catchError(this.toApiError));
  }

  delete(path: string): Observable<void> {
    return this.http.delete<void>(this.base + path).pipe(catchError(this.toApiError));
  }

  private toApiError(error: HttpErrorResponse) {
    const message = error.error?.message ?? 'Não foi possível completar a operação.';
    return throwError(() => new ApiError(message, error.status));
  }
}
