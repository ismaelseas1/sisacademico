import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../../core/api';
import { Auth } from '../../core/auth';
import { Docente, EstadoProyecto, Estudiante, Proyecto } from '../../core/models';
import { Avisos } from '../../shared/avisos';
import { capitalizar } from '../../shared/formato';

/**
 * Alta y edicion de proyectos.
 *   - estudiante: el autor es el mismo y el proyecto inicia en "pendiente";
 *   - admin: elige autor y estado.
 */
@Component({
  selector: 'app-proyecto-form',
  imports: [FormsModule, RouterLink],
  template: `
    <a class="btn btn--texto btn--chico" [routerLink]="id() ? ['/proyectos', id()] : ['/proyectos']">‹ Volver</a>
    <div class="cabecera" style="margin-top:8px">
      <h1>{{ id() ? 'Editar proyecto' : 'Nuevo proyecto' }}</h1>
    </div>

    <form class="tarjeta" (ngSubmit)="guardar()" novalidate style="max-width:820px">
      <div class="formulario">
        <label class="campo ancho">
          <span>Título del proyecto *</span>
          <input name="titulo" [(ngModel)]="titulo" maxlength="200" placeholder="Ej. Sistema de reservas de laboratorios" [class.invalido]="errores()['titulo']" />
          @if (errores()['titulo']) { <small class="error">{{ errores()['titulo'] }}</small> }
        </label>
        <label class="campo ancho">
          <span>Descripción</span>
          <textarea name="descripcion" [(ngModel)]="descripcion" placeholder="Describe el objetivo del proyecto…"></textarea>
        </label>
        @if (esAdmin && !id()) {
          <label class="campo">
            <span>Autor (estudiante) *</span>
            <select name="autor" [(ngModel)]="estudianteId" [class.invalido]="errores()['estudiante_id']">
              <option [ngValue]="null">Seleccionar…</option>
              @for (e of estudiantes(); track e.id) {
                <option [ngValue]="e.id">{{ e.registro }} · {{ e.nombre }}</option>
              }
            </select>
            @if (errores()['estudiante_id']) { <small class="error">{{ errores()['estudiante_id'] }}</small> }
          </label>
        }
        <label class="campo">
          <span>Docente tutor</span>
          <select name="tutor" [(ngModel)]="tutorId">
            <option [ngValue]="null">Sin tutor</option>
            @for (d of docentes(); track d.id) {
              <option [ngValue]="d.id">{{ d.nombre }}</option>
            }
          </select>
        </label>
        @if (esAdmin) {
          <label class="campo">
            <span>Estado</span>
            <select name="estado" [(ngModel)]="estadoId">
              @for (e of estados(); track e.id) {
                <option [ngValue]="e.id">{{ capitalizar(e.nombre) }}</option>
              }
            </select>
          </label>
        }
        <label class="campo">
          <span>Fecha de inicio</span>
          <input type="date" name="inicio" [(ngModel)]="fechaInicio" />
        </label>
        <label class="campo">
          <span>Fecha de fin</span>
          <input type="date" name="fin" [(ngModel)]="fechaFin" [class.invalido]="errores()['fecha_fin']" />
          @if (errores()['fecha_fin']) { <small class="error">{{ errores()['fecha_fin'] }}</small> }
        </label>
      </div>

      @if (!esAdmin && !id()) {
        <div class="alerta" style="margin-top:16px">⭐ Quedarás registrado como autor y líder del equipo. El proyecto inicia en estado Pendiente; después podrás agregar a tus compañeros.</div>
      }
      @if (error()) {
        <div class="alerta alerta--error" style="margin-top:16px" role="alert">{{ error() }}</div>
      }

      <div class="modal-acciones">
        <a class="btn btn--texto" [routerLink]="id() ? ['/proyectos', id()] : ['/proyectos']">Cancelar</a>
        <button class="btn" type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : id() ? 'Guardar cambios' : 'Crear proyecto' }}</button>
      </div>
    </form>
  `,
})
export class ProyectoFormPage implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);

  protected readonly capitalizar = capitalizar;

  /** Presente al editar (/proyectos/:id/editar). */
  readonly id = input<string>();

  protected readonly esAdmin = this.auth.rol() === 'admin';
  protected titulo = '';
  protected descripcion = '';
  protected tutorId: number | null = null;
  protected estudianteId: number | null = null;
  protected estadoId: number | null = null;
  protected fechaInicio = '';
  protected fechaFin = '';

  protected readonly docentes = signal<Docente[]>([]);
  protected readonly estados = signal<EstadoProyecto[]>([]);
  protected readonly estudiantes = signal<Estudiante[]>([]);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly errores = signal<Record<string, string>>({});

  async ngOnInit(): Promise<void> {
    try {
      const [docentes, estados] = await Promise.all([
        firstValueFrom(this.api.todos<Docente>('docentes')),
        firstValueFrom(this.api.todos<EstadoProyecto>('estados-proyecto')),
      ]);
      this.docentes.set(docentes);
      this.estados.set(estados);
      this.estadoId = estados.find((e) => e.nombre === 'pendiente')?.id ?? null;

      if (this.esAdmin && !this.id()) {
        this.estudiantes.set(await firstValueFrom(this.api.todos<Estudiante>('estudiantes')));
      }

      if (this.id()) {
        const p = await firstValueFrom(this.api.ver<Proyecto>(`proyectos/${this.id()}`));
        this.titulo = p.titulo;
        this.descripcion = p.descripcion ?? '';
        this.tutorId = p.tutor_id ?? null;
        this.estadoId = p.estado_id;
        this.fechaInicio = p.fecha_inicio ?? '';
        this.fechaFin = p.fecha_fin ?? '';
      }
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudo cargar el formulario.');
    }
  }

  protected async guardar(): Promise<void> {
    if (!this.titulo.trim()) {
      this.errores.set({ titulo: 'El título del proyecto es obligatorio.' });
      return;
    }
    if (this.fechaInicio && this.fechaFin && this.fechaFin < this.fechaInicio) {
      this.errores.set({ fecha_fin: 'La fecha de fin no puede ser anterior a la de inicio.' });
      return;
    }

    const datos: Record<string, unknown> = {
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim() || null,
      tutor_id: this.tutorId,
      fecha_inicio: this.fechaInicio || null,
      fecha_fin: this.fechaFin || null,
    };
    if (this.esAdmin) {
      datos['estado_id'] = this.estadoId;
    }
    if (!this.id()) {
      datos['estudiante_id'] = this.esAdmin ? this.estudianteId : this.auth.usuario()?.estudiante?.id;
      datos['estado_id'] = this.estadoId;
    }

    this.guardando.set(true);
    this.error.set('');
    this.errores.set({});
    try {
      const p = this.id()
        ? await firstValueFrom(this.api.actualizar<Proyecto>(`proyectos/${this.id()}`, datos))
        : await firstValueFrom(this.api.crear<Proyecto>('proyectos', datos));
      this.avisos.exito(this.id() ? 'Proyecto actualizado.' : 'Proyecto creado.');
      await this.router.navigate(['/proyectos', p?.id ?? this.id()]);
    } catch (e) {
      if (e instanceof ApiError) {
        this.errores.set(e.campos);
        this.error.set(e.message);
      } else {
        this.error.set('No se pudo guardar el proyecto.');
      }
    } finally {
      this.guardando.set(false);
    }
  }
}
