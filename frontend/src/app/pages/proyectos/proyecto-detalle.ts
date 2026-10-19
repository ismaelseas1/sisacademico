import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../../core/api';
import { Auth } from '../../core/auth';
import { EstadoProyecto, Estudiante, Proyecto, ProyectoMiembro } from '../../core/models';
import { Avisos } from '../../shared/avisos';
import { capitalizar, claseEstado, iniciales, rangoFechas } from '../../shared/formato';

/**
 * Detalle del proyecto. Las acciones siguen las reglas de ProyectoPolicy del backend:
 *   - admin: todo;
 *   - docente tutor: cambiar estado y gestionar miembros;
 *   - estudiante lider: editar datos y miembros (no el estado); el autor ademas elimina.
 */
@Component({
  selector: 'app-proyecto-detalle',
  imports: [FormsModule, RouterLink],
  template: `
    <a class="btn btn--texto btn--chico" routerLink="/proyectos">‹ Volver a proyectos</a>

    @if (error()) {
      <div class="alerta alerta--error" role="alert" style="margin-top:12px">{{ error() }}</div>
    }

    @if (proyecto(); as p) {
      <div class="tarjeta tarjeta--marca pila" style="margin-top:12px">
        <span class="chip chip--sin-punto" style="background:rgba(255,255,255,.14);color:#dfe4ff;align-self:flex-start">
          {{ capitalizar(p.estado?.nombre) }}
        </span>
        <h1 style="color:#fff">{{ p.titulo }}</h1>
        <p class="suave">{{ p.descripcion || 'Sin descripción.' }}</p>
      </div>

      <div class="grilla grilla--3 seccion" style="margin-top:14px">
        <div class="tarjeta"><span class="rotulo">Autor</span><h3>{{ p.estudiante?.nombre ?? '—' }}</h3></div>
        <div class="tarjeta"><span class="rotulo">Tutor</span><h3>{{ p.tutor?.nombre ?? 'Sin asignar' }}</h3></div>
        <div class="tarjeta"><span class="rotulo">Duración</span><h3>{{ rangoFechas(p) }}</h3></div>
      </div>

      @if (puedeCambiarEstado()) {
        <div class="tarjeta fila" style="margin-top:14px;align-items:flex-end">
          <label class="campo" style="flex:1 1 240px">
            <span>Estado del proyecto</span>
            <select [(ngModel)]="estadoId">
              @for (e of estados(); track e.id) {
                <option [ngValue]="e.id">{{ capitalizar(e.nombre) }}</option>
              }
            </select>
          </label>
          <button class="btn" type="button" [disabled]="estadoId === p.estado_id" (click)="guardarEstado()">Guardar estado</button>
        </div>
      }

      <div class="fila fila--entre seccion">
        <h2>Miembros del equipo</h2>
        <span class="codigo">{{ p.miembros?.length ?? 0 }} integrantes</span>
      </div>
      <div class="tarjeta" style="padding:4px 18px">
        @for (m of p.miembros ?? []; track m.id) {
          <div class="miembro">
            <div class="avatar">{{ iniciales(m.estudiante?.nombre) }}</div>
            <div class="item__cuerpo">
              <strong>{{ m.estudiante?.nombre }}</strong>
              <span class="suave chico">{{ m.es_lider ? 'Líder · ' : '' }}{{ m.rol }} · {{ m.estudiante?.registro }}</span>
            </div>
            @if (m.es_lider) {
              <span class="estrella" title="Líder del equipo" aria-label="Líder">★</span>
            } @else if (puedeGestionarMiembros()) {
              <button class="btn btn--peligro btn--chico" type="button" (click)="quitar(m)">Quitar</button>
            }
          </div>
        }
      </div>

      @if (puedeGestionarMiembros()) {
        <form class="tarjeta formulario" style="margin-top:14px;align-items:end" (ngSubmit)="agregar()">
          <label class="campo">
            <span>Agregar estudiante</span>
            <select name="nuevo" [(ngModel)]="nuevoEstudiante">
              <option [ngValue]="null">Seleccionar…</option>
              @for (e of candidatos(); track e.id) {
                <option [ngValue]="e.id">{{ e.registro }} · {{ e.nombre }}</option>
              }
            </select>
          </label>
          <label class="campo">
            <span>Rol en el equipo</span>
            <input name="rol" [(ngModel)]="nuevoRol" placeholder="Ej. Desarrollo frontend" maxlength="50" />
          </label>
          <button class="btn btn--sec" type="submit" [disabled]="!nuevoEstudiante || !nuevoRol.trim()">＋ Agregar miembro</button>
        </form>
      }

      @if (auth.rol() === 'estudiante' && !esLider()) {
        <div class="alerta" style="margin-top:14px">Solo el líder del equipo puede editar el proyecto y sus miembros.</div>
      }

      <div class="fila" style="margin-top:20px">
        @if (puedeEditar()) {
          <a class="btn btn--sec" [routerLink]="['/proyectos', p.id, 'editar']">✎ Editar proyecto</a>
        }
        @if (puedeEliminar()) {
          <button class="btn btn--peligro" type="button" (click)="eliminar()">Eliminar proyecto</button>
        }
      </div>
    } @else if (!error()) {
      <div class="cargando">Cargando proyecto…</div>
    }
  `,
})
export class ProyectoDetallePage {
  protected readonly auth = inject(Auth);
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);

  protected readonly capitalizar = capitalizar;
  protected readonly claseEstado = claseEstado;
  protected readonly iniciales = iniciales;
  protected readonly rangoFechas = rangoFechas;

  readonly id = input.required<string>();

  protected readonly proyecto = signal<Proyecto | null>(null);
  protected readonly estados = signal<EstadoProyecto[]>([]);
  protected readonly estudiantes = signal<Estudiante[]>([]);
  protected readonly error = signal('');
  protected estadoId = 0;
  protected nuevoEstudiante: number | null = null;
  protected nuevoRol = '';

  protected readonly esTutor = computed(() => {
    const d = this.auth.usuario()?.docente;
    return !!d && this.proyecto()?.tutor_id === d.id;
  });
  protected readonly esLider = computed(() => {
    const e = this.auth.usuario()?.estudiante;
    return !!e && !!this.proyecto()?.miembros?.some((m) => m.estudiante_id === e.id && m.es_lider);
  });
  protected readonly esAdmin = computed(() => this.auth.rol() === 'admin');
  protected readonly puedeCambiarEstado = computed(() => this.esAdmin() || this.esTutor());
  protected readonly puedeGestionarMiembros = computed(() => this.esAdmin() || this.esTutor() || this.esLider());
  protected readonly puedeEditar = computed(() => this.esAdmin() || this.esTutor() || this.esLider());
  protected readonly puedeEliminar = computed(
    () => this.esAdmin() || this.auth.usuario()?.estudiante?.id === this.proyecto()?.estudiante_id,
  );
  protected readonly candidatos = computed(() => {
    const miembros = new Set(this.proyecto()?.miembros?.map((m) => m.estudiante_id));
    return this.estudiantes().filter((e) => !miembros.has(e.id));
  });

  constructor() {
    effect(() => {
      this.id();
      this.cargar();
    });
  }

  private async cargar(): Promise<void> {
    this.error.set('');
    try {
      // El catalogo de estados llega junto con el proyecto, para que el select muestre el estado actual.
      const [p, estados] = await Promise.all([
        firstValueFrom(this.api.ver<Proyecto>(`proyectos/${this.id()}`)),
        this.estados().length ? Promise.resolve(this.estados()) : firstValueFrom(this.api.todos<EstadoProyecto>('estados-proyecto')),
      ]);
      this.estados.set(estados);
      this.estadoId = p.estado_id;
      this.proyecto.set(p);
      if (this.puedeGestionarMiembros() && !this.estudiantes().length) {
        this.estudiantes.set(await firstValueFrom(this.api.todos<Estudiante>('estudiantes')));
      }
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudo cargar el proyecto.');
    }
  }

  protected async guardarEstado(): Promise<void> {
    const p = this.proyecto()!;
    const nuevo = this.estados().find((e) => e.id === this.estadoId);
    const ok = await this.avisos.confirmar(
      '¿Cambiar el estado?',
      `El proyecto pasará de "${capitalizar(p.estado?.nombre)}" a "${capitalizar(nuevo?.nombre)}". El equipo recibirá una notificación en la app.`,
      'Guardar',
    );
    if (ok) {
      await this.ejecutar(() => this.api.actualizar(`proyectos/${p.id}`, { estado_id: this.estadoId }), 'Estado actualizado.');
    }
  }

  protected async agregar(): Promise<void> {
    const p = this.proyecto()!;
    const ok = await this.ejecutar(
      () => this.api.crear(`proyectos/${p.id}/miembros`, { estudiante_id: this.nuevoEstudiante, rol: this.nuevoRol.trim() }),
      'Miembro agregado al equipo.',
    );
    if (ok) {
      this.nuevoEstudiante = null;
      this.nuevoRol = '';
    }
  }

  protected async quitar(m: ProyectoMiembro): Promise<void> {
    const ok = await this.avisos.confirmar('¿Quitar del equipo?', `${m.estudiante?.nombre} dejará de ser miembro de este proyecto.`, 'Quitar', true);
    if (ok) {
      await this.ejecutar(() => this.api.eliminar(`proyectos/${this.proyecto()!.id}/miembros/${m.id}`), 'Miembro retirado.');
    }
  }

  protected async eliminar(): Promise<void> {
    const p = this.proyecto()!;
    const ok = await this.avisos.confirmar('¿Eliminar el proyecto?', `Se eliminará "${p.titulo}" junto con su equipo. Esta acción no se puede deshacer.`, 'Eliminar', true);
    if (!ok) {
      return;
    }
    try {
      await firstValueFrom(this.api.eliminar(`proyectos/${p.id}`));
      this.avisos.exito('Proyecto eliminado.');
      await this.router.navigate(['/proyectos']);
    } catch (e) {
      this.avisos.error(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  /** Ejecuta la accion, muestra el resultado y recarga el proyecto. */
  private async ejecutar(accion: () => Observable<unknown>, mensaje: string): Promise<boolean> {
    try {
      await firstValueFrom(accion());
      this.avisos.exito(mensaje);
      await this.cargar();
      return true;
    } catch (e) {
      this.avisos.error(e instanceof ApiError ? e.message : 'No se pudo completar la acción.');
      return false;
    }
  }
}
