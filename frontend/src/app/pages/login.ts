import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiError } from '../core/api';
import { Auth } from '../core/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login">
      <section class="login__marca">
        <img src="logo-uno-blanco.png" alt="Universidad Nacional del Oriente" />
        <div>
          <div class="rotulo" style="color:#c3cbff">SISTEMA ACADÉMICO</div>
          <h1>Gestión académica de la UNO</h1>
          <p>Administración de usuarios, estructura académica, inscripciones y proyectos. Estudiantes y docentes también pueden ingresar.</p>
        </div>
        <p class="chico">Universidad Nacional del Oriente · Santa Cruz, Bolivia</p>
      </section>

      <section class="login__form">
        <form (ngSubmit)="ingresar()" novalidate>
          <img class="login__logo-movil" src="logo-uno.png" alt="Universidad Nacional del Oriente" />
          <div>
            <h2 style="font-size:24px">Iniciar sesión</h2>
            <p class="suave">Ingresa con tu usuario o correo institucional.</p>
          </div>

          @if (expirada()) {
            <div class="alerta">Tu sesión expiró. Vuelve a iniciar sesión.</div>
          }

          <label class="campo">
            <span>Usuario o correo</span>
            <input name="identificador" [(ngModel)]="identificador" autocomplete="username" placeholder="Ej. admin o admin@uno.edu.bo" required />
          </label>
          <label class="campo">
            <span>Contraseña</span>
            <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" placeholder="Tu contraseña" required />
          </label>

          @if (error()) {
            <div class="alerta alerta--error" role="alert">{{ error() }}</div>
          }

          <button class="btn btn--bloque" type="submit" [disabled]="cargando()">
            {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
          </button>
          @if (cargando()) {
            <p class="suave chico" style="text-align:center">Si el servidor estaba inactivo puede tardar hasta un minuto en responder.</p>
          }
          <p class="suave chico" style="text-align:center">¿Olvidaste tu contraseña? Solicita el cambio en Dirección Académica.</p>
        </form>
      </section>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  /** ?expirada=1 cuando el interceptor cerro la sesion por un 401. */
  readonly expirada = input<string>();

  protected identificador = '';
  protected password = '';
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected async ingresar(): Promise<void> {
    if (!this.identificador.trim() || !this.password) {
      this.error.set('Ingresa tu usuario o correo y tu contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    try {
      await this.auth.iniciar(this.identificador, this.password);
      await this.router.navigate(['/inicio']);
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      this.cargando.set(false);
    }
  }
}
