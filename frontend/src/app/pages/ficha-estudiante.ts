import { Component, effect, inject, input, signal } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../core/api';
import { Estudiante, Proyecto } from '../core/models';
import { capitalizar, claseEstado, fecha, iniciales, ppa, rangoFechas } from '../shared/formato';

/** Ficha de un estudiante (consulta para docente y admin): datos, materias inscritas y proyectos. */
@Component({
  selector: 'app-ficha-estudiante',
  imports: [RouterLink],
  template: `
    <button class="btn btn--texto btn--chico" type="button" (click)="volver()">‹ Volver</button>

    @if (error()) {
      <div class="alerta alerta--error" role="alert" style="margin-top:12px">{{ error() }}</div>
    }

    @if (e(); as e) {
      <div class="tarjeta fila" style="gap:16px;margin-top:12px">
        <div class="avatar avatar--grande">{{ iniciales(e.nombre) }}</div>
        <div style="flex:1">
          <h1>{{ e.nombre }}</h1>
          <p class="suave">{{ e.carrera?.nombre }} · {{ e.carrera?.facultad?.nombre }}</p>
        </div>
      </div>

      <div class="tarjeta datos" style="margin-top:14px">
        <div><span class="rotulo">Registro</span><strong>{{ e.registro }}</strong></div>
        <div><span class="rotulo">Semestre</span><strong>{{ e.semestre }}.º</strong></div>
        <div><span class="rotulo">PPA</span><strong style="color:var(--exito)">{{ ppa(e.ppa) }}</strong></div>
        <div><span class="rotulo">Fecha de nacimiento</span><strong>{{ fecha(e.fecha_nacimiento) }}</strong></div>
        <div><span class="rotulo">Correo</span><strong>{{ e.usuario?.email ?? '—' }}</strong></div>
      </div>

      <div class="pestanas seccion" role="tablist">
        <button type="button" role="tab" [class.activa]="pestana() === 'materias'" [attr.aria-selected]="pestana() === 'materias'" (click)="pestana.set('materias')">
          Materias inscritas ({{ e.materias?.length ?? 0 }})
        </button>
        <button type="button" role="tab" [class.activa]="pestana() === 'proyectos'" [attr.aria-selected]="pestana() === 'proyectos'" (click)="pestana.set('proyectos')">
          Proyectos ({{ proyectos().length }})
        </button>
      </div>

      @if (pestana() === 'materias') {
        <div class="tabla-caja">
          <table>
            <thead><tr><th>Código</th><th>Materia</th><th>Semestre</th><th>Créditos</th></tr></thead>
            <tbody>
              @for (m of e.materias ?? []; track m.id) {
                <tr><td class="codigo">{{ m.codigo }}</td><td>{{ m.nombre }}</td><td>{{ m.semestre_materia }}.º</td><td>{{ m.creditos }}</td></tr>
              } @empty {
                <tr><td colspan="4"><div class="vacio">Sin materias inscritas.</div></td></tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="lista">
          @for (p of proyectos(); track p.id) {
            <a class="tarjeta item" [routerLink]="['/proyectos', p.id]">
              <div class="avatar">📁</div>
              <div class="item__cuerpo">
                <strong>{{ p.titulo }}</strong>
                <span class="suave chico">Tutor: {{ p.tutor?.nombre ?? 'sin asignar' }} · {{ rangoFechas(p) }}</span>
              </div>
              <span [class]="claseEstado(p.estado?.nombre)">{{ capitalizar(p.estado?.nombre) }}</span>
            </a>
          } @empty {
            <div class="tarjeta vacio">Este estudiante aún no participa en proyectos.</div>
          }
        </div>
      }
    } @else if (!error()) {
      <div class="cargando">Cargando ficha…</div>
    }
  `,
})
export class FichaEstudiantePage {
  private readonly api = inject(Api);
  private readonly location = inject(Location);

  protected readonly capitalizar = capitalizar;
  protected readonly claseEstado = claseEstado;
  protected readonly fecha = fecha;
  protected readonly iniciales = iniciales;
  protected readonly ppa = ppa;
  protected readonly rangoFechas = rangoFechas;

  readonly id = input.required<string>();
  protected readonly e = signal<Estudiante | null>(null);
  protected readonly proyectos = signal<Proyecto[]>([]);
  protected readonly pestana = signal<'materias' | 'proyectos'>('materias');
  protected readonly error = signal('');

  constructor() {
    effect(async () => {
      const id = this.id();
      try {
        const [e, proyectos] = await Promise.all([
          firstValueFrom(this.api.ver<Estudiante>(`estudiantes/${id}`)),
          firstValueFrom(this.api.todos<Proyecto>('proyectos', { miembro_id: id })),
        ]);
        this.e.set(e);
        this.proyectos.set(proyectos);
      } catch (err) {
        this.error.set(err instanceof ApiError ? err.message : 'No se pudo cargar la ficha.');
      }
    });
  }

  protected volver(): void {
    this.location.back();
  }
}
