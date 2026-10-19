import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Auth } from '../core/auth';
import { NombreRol } from '../core/models';
import { iniciales } from '../shared/formato';

interface Enlace {
  ruta: string;
  texto: string;
  icono: string;
  grupo?: string;
}

/** Menu lateral segun el rol. La administracion completa solo la ve el admin. */
const MENUS: Record<NombreRol, Enlace[]> = {
  admin: [
    { ruta: '/inicio', texto: 'Panel', icono: '🏠' },
    { ruta: '/admin/usuarios', texto: 'Usuarios', icono: '👤', grupo: 'PERSONAS' },
    { ruta: '/admin/estudiantes', texto: 'Estudiantes', icono: '🎓' },
    { ruta: '/admin/docentes', texto: 'Docentes', icono: '🧑‍🏫' },
    { ruta: '/admin/facultades', texto: 'Facultades', icono: '🏛', grupo: 'ESTRUCTURA ACADÉMICA' },
    { ruta: '/admin/carreras', texto: 'Carreras', icono: '📚' },
    { ruta: '/admin/materias', texto: 'Materias', icono: '📘' },
    { ruta: '/admin/inscripciones', texto: 'Inscripciones', icono: '📝', grupo: 'GESTIÓN' },
    { ruta: '/proyectos', texto: 'Proyectos', icono: '📁' },
    { ruta: '/admin/auditoria', texto: 'Auditoría', icono: '🕑' },
  ],
  docente: [
    { ruta: '/inicio', texto: 'Inicio', icono: '🏠' },
    { ruta: '/proyectos', texto: 'Proyectos que tutoro', icono: '📁' },
    { ruta: '/estudiantes', texto: 'Estudiantes', icono: '🎓' },
    { ruta: '/perfil', texto: 'Mi perfil', icono: '👤' },
  ],
  estudiante: [
    { ruta: '/inicio', texto: 'Inicio', icono: '🏠' },
    { ruta: '/mis-materias', texto: 'Mis materias', icono: '📘' },
    { ruta: '/inscripcion', texto: 'Inscribir materia', icono: '➕' },
    { ruta: '/proyectos', texto: 'Mis proyectos', icono: '📁' },
    { ruta: '/perfil', texto: 'Mi perfil', icono: '👤' },
  ],
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="movil-barra">
      <button type="button" (click)="abierto.set(true)" aria-label="Abrir menú">☰</button>
      <img src="logo-uno-blanco.png" alt="UNO" />
    </header>

    <div class="shell">
      <aside class="barra" [class.abierta]="abierto()" aria-label="Menú principal">
        <img class="barra__logo" src="logo-uno-blanco.png" alt="Universidad Nacional del Oriente" />
        <div class="barra__sub">SISTEMA ACADÉMICO</div>
        <nav>
          @for (e of menu(); track e.ruta) {
            @if (e.grupo) {
              <div class="barra__grupo">{{ e.grupo }}</div>
            }
            <a [routerLink]="e.ruta" routerLinkActive="activo"><span aria-hidden="true">{{ e.icono }}</span>{{ e.texto }}</a>
          }
        </nav>
        <div class="barra__usuario">
          <div class="avatar">{{ inicialesUsuario() }}</div>
          <div>
            <strong>{{ auth.nombre() }}</strong>
            <span>{{ auth.rol() }}</span>
          </div>
          <button type="button" class="barra__salir" (click)="salir()" title="Cerrar sesión">Salir</button>
        </div>
      </aside>

      <main class="contenido">
        <router-outlet />
      </main>
    </div>
  `,
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly abierto = signal(false);
  protected readonly menu = computed(() => MENUS[this.auth.rol() ?? 'estudiante']);
  protected readonly inicialesUsuario = computed(() => iniciales(this.auth.nombre()));

  constructor() {
    // En celular, el menu se cierra al navegar.
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.abierto.set(false));
  }

  protected salir(): void {
    this.auth.cerrar();
  }
}
