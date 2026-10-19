import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api } from './api';
import { NombreRol, Usuario } from './models';

const CLAVE_TOKEN = 'sisacademico_token';

/** Sesion del usuario: token Bearer de Sanctum (en localStorage) y perfil de GET /me. */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  readonly usuario = signal<Usuario | null>(null);
  readonly rol = computed<NombreRol | null>(() => this.usuario()?.rol?.nombre ?? null);
  readonly nombre = computed(
    () => this.usuario()?.estudiante?.nombre ?? this.usuario()?.docente?.nombre ?? this.usuario()?.username ?? '',
  );

  get token(): string | null {
    try {
      return localStorage.getItem(CLAVE_TOKEN);
    } catch {
      return null;
    }
  }

  async iniciar(identificador: string, password: string): Promise<Usuario> {
    const r = await firstValueFrom(
      this.api.post<{ token: string }>('login', { identificador: identificador.trim(), password }),
    );
    this.guardarToken(r.token);
    return this.cargarPerfil();
  }

  /** Restaura la sesion guardada al recargar la pagina. */
  async restaurar(): Promise<Usuario | null> {
    if (this.usuario()) {
      return this.usuario();
    }
    if (!this.token) {
      return null;
    }
    try {
      return await this.cargarPerfil();
    } catch {
      this.limpiar();
      return null;
    }
  }

  async cargarPerfil(): Promise<Usuario> {
    const usuario = await firstValueFrom(this.api.ver<Usuario>('me'));
    this.usuario.set(usuario);
    return usuario;
  }

  async cerrar(): Promise<void> {
    try {
      await firstValueFrom(this.api.post('logout', {}));
    } catch {
      // Aunque el servidor no responda, la sesion se cierra en este navegador.
    }
    this.limpiar();
    await this.router.navigate(['/login']);
  }

  limpiar(): void {
    this.usuario.set(null);
    this.guardarToken(null);
  }

  private guardarToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(CLAVE_TOKEN, token);
      } else {
        localStorage.removeItem(CLAVE_TOKEN);
      }
    } catch {
      // Navegador sin almacenamiento (modo privado estricto): la sesion dura lo que la pestana.
    }
  }
}
