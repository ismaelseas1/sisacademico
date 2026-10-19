import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Pagina, Respuesta } from './models';

export type Parametros = Record<string, string | number | boolean | null | undefined>;

/** Error de la API con un mensaje listo para mostrar y los errores por campo (422). */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly estado: number,
    readonly campos: Record<string, string> = {},
  ) {
    super(message);
  }
}

/**
 * Acceso a /api/v1. El token lo agrega el interceptor (core/interceptor.ts);
 * aqui solo se arman las URLs y se traducen los errores de Laravel a ApiError.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  readonly base = environment.apiUrl;

  listar<T>(ruta: string, parametros: Parametros = {}): Observable<Pagina<T>> {
    return this.http
      .get<Pagina<T>>(`${this.base}/${ruta}`, { params: this.params(parametros) })
      .pipe(catchError(convertirError));
  }

  /** Trae todos los registros (hasta 100) de una coleccion: para selects y listas cortas. */
  todos<T>(ruta: string, parametros: Parametros = {}): Observable<T[]> {
    return this.listar<T>(ruta, { por_pagina: 100, ...parametros }).pipe(map((p) => p.data));
  }

  ver<T>(ruta: string): Observable<T> {
    return this.http.get<Respuesta<T>>(`${this.base}/${ruta}`).pipe(
      map((r) => r.data),
      catchError(convertirError),
    );
  }

  crear<T>(ruta: string, datos: unknown): Observable<T> {
    return this.http.post<Respuesta<T>>(`${this.base}/${ruta}`, datos).pipe(
      map((r) => r?.data),
      catchError(convertirError),
    );
  }

  actualizar<T>(ruta: string, datos: unknown): Observable<T> {
    return this.http.put<Respuesta<T>>(`${this.base}/${ruta}`, datos).pipe(
      map((r) => r?.data),
      catchError(convertirError),
    );
  }

  eliminar(ruta: string, cuerpo?: unknown): Observable<unknown> {
    return this.http.delete(`${this.base}/${ruta}`, { body: cuerpo }).pipe(catchError(convertirError));
  }

  /** Peticion cruda (login, logout): devuelve el JSON tal cual. */
  post<T>(ruta: string, datos: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${ruta}`, datos).pipe(catchError(convertirError));
  }

  private params(parametros: Parametros): HttpParams {
    let p = new HttpParams();
    for (const [clave, valor] of Object.entries(parametros)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        p = p.set(clave, String(valor));
      }
    }
    return p;
  }
}

function convertirError(error: HttpErrorResponse): Observable<never> {
  if (error.status === 0) {
    return throwError(
      () =>
        new ApiError(
          'No se pudo conectar con el servidor. Si es la primera vez en un rato, está despertando: espera unos segundos e inténtalo de nuevo.',
          0,
        ),
    );
  }

  const cuerpo = error.error ?? {};
  const campos: Record<string, string> = {};
  for (const [campo, mensajes] of Object.entries<string[]>(cuerpo.errors ?? {})) {
    campos[campo] = mensajes[0];
  }

  const porDefecto: Record<number, string> = {
    401: 'Tu sesión expiró. Vuelve a iniciar sesión.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'No se encontró la información solicitada.',
  };

  const primerCampo = Object.values(campos)[0];
  const mensaje =
    (error.status === 422 && primerCampo) ||
    cuerpo.message ||
    porDefecto[error.status] ||
    `Error del servidor (${error.status}). Inténtalo más tarde.`;

  return throwError(() => new ApiError(mensaje, error.status, campos));
}
