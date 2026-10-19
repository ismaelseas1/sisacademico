import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../../core/api';
import { Auth } from '../../core/auth';
import { Estudiante, Inscripcion, Materia } from '../../core/models';
import { Avisos } from '../../shared/avisos';
import { fecha } from '../../shared/formato';

/** Materias inscritas del estudiante, con baja. */
@Component({
  selector: 'app-mis-materias',
  imports: [RouterLink],
  template: `
    <div class="cabecera">
      <div>
        <h1>Mis materias</h1>
        <p class="suave">Materias en las que estás inscrito este periodo.</p>
      </div>
      <a class="btn" routerLink="/inscripcion">＋ Inscribir materia</a>
    </div>

    <div class="tarjeta tarjeta--marca fila fila--entre">
      <div>
        <span class="rotulo">Semestre actual</span>
        <h3>{{ ficha()?.semestre }}.º semestre · {{ ficha()?.carrera?.nombre }}</h3>
      </div>
      <div class="metrica" style="text-align:right">
        <strong style="color:#fff">{{ creditos() }}</strong><span class="suave">créditos</span>
      </div>
    </div>

    @if (error()) {
      <div class="alerta alerta--error" role="alert" style="margin-top:14px">{{ error() }}</div>
    }

    <div class="lista seccion">
      @for (i of inscripciones(); track i.id) {
        <div class="tarjeta item">
          <div class="avatar">{{ (i.materia?.codigo ?? '').split('-')[0] }}</div>
          <div class="item__cuerpo">
            <span class="codigo">{{ i.materia?.codigo }}</span>
            <strong>{{ i.materia?.nombre }}</strong>
            <span class="suave chico">Inscrita el {{ fecha(i.fecha_inscripcion) }} · {{ i.materia?.creditos ?? 0 }} créditos</span>
          </div>
          <button class="btn btn--peligro btn--chico" type="button" (click)="darDeBaja(i)">Dar de baja</button>
        </div>
      } @empty {
        <div class="tarjeta vacio">
          @if (cargando()) { <div class="cargando">Cargando…</div> } @else {
            <strong>Aún no tienes materias inscritas</strong>
            <a routerLink="/inscripcion">Inscribirme en una materia</a>
          }
        </div>
      }
    </div>
  `,
})
export class MisMateriasPage implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);
  private readonly avisos = inject(Avisos);

  protected readonly fecha = fecha;
  protected readonly ficha = signal<Estudiante | null>(null);
  protected readonly inscripciones = signal<Inscripcion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly creditos = computed(() => this.inscripciones().reduce((s, i) => s + (i.materia?.creditos ?? 0), 0));

  async ngOnInit(): Promise<void> {
    const id = this.auth.usuario()?.estudiante?.id;
    if (!id) {
      return;
    }
    try {
      this.ficha.set(await firstValueFrom(this.api.ver<Estudiante>(`estudiantes/${id}`)));
      await this.cargar();
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudieron cargar tus materias.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargar(): Promise<void> {
    const id = this.auth.usuario()!.estudiante!.id;
    this.inscripciones.set(await firstValueFrom(this.api.todos<Inscripcion>('inscripciones', { estudiante_id: id })));
  }

  protected async darDeBaja(i: Inscripcion): Promise<void> {
    const ok = await this.avisos.confirmar('¿Dar de baja la materia?', `Se eliminará tu inscripción en ${i.materia?.nombre} (${i.materia?.codigo}).`, 'Dar de baja', true);
    if (!ok) {
      return;
    }
    try {
      await firstValueFrom(this.api.eliminar(`inscripciones/${i.id}`));
      this.avisos.exito('Inscripción eliminada.');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e instanceof ApiError ? e.message : 'No se pudo dar de baja.');
    }
  }
}

/** Inscripcion a materias de la carrera del estudiante, por semestre. */
@Component({
  selector: 'app-inscripcion',
  imports: [FormsModule, RouterLink],
  template: `
    <a class="btn btn--texto btn--chico" routerLink="/mis-materias">‹ Mis materias</a>
    <div class="cabecera" style="margin-top:8px">
      <div>
        <h1>Inscribir materia</h1>
        <p class="suave">Materias de {{ ficha()?.carrera?.nombre ?? 'tu carrera' }}. No puedes inscribirte dos veces en la misma materia.</p>
      </div>
    </div>

    <div class="buscador">
      <select [ngModel]="semestre()" (ngModelChange)="cambiarSemestre($event)" aria-label="Semestre de la materia">
        @for (s of semestres; track s) {
          <option [ngValue]="s">{{ s }}.º semestre</option>
        }
      </select>
      <span class="chip chip--finalizado chip--sin-punto" style="align-self:center">{{ disponibles() }} disponibles</span>
    </div>

    @if (error()) {
      <div class="alerta alerta--error" role="alert">{{ error() }}</div>
    }

    <div class="grilla grilla--2">
      @for (m of materias(); track m.id) {
        <div class="tarjeta fila fila--entre">
          <div class="item__cuerpo">
            <span class="codigo">{{ m.codigo }}</span>
            <strong>{{ m.nombre }}</strong>
            <span class="suave chico">{{ m.creditos ?? 0 }} créditos · {{ m.semestre_materia }}.º semestre</span>
          </div>
          @if (inscritas().has(m.id)) {
            <span class="chip chip--finalizado">Inscrita</span>
          } @else {
            <button class="btn btn--sec btn--chico" type="button" (click)="inscribir(m)">Inscribirme</button>
          }
        </div>
      } @empty {
        <div class="tarjeta vacio" style="grid-column:1/-1">
          @if (cargando()) { <div class="cargando">Cargando…</div> } @else { <strong>Sin materias en este semestre</strong>Prueba con otro semestre. }
        </div>
      }
    </div>
  `,
})
export class InscripcionPage implements OnInit {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);
  private readonly avisos = inject(Avisos);

  protected readonly semestres = Array.from({ length: 10 }, (_, i) => i + 1);
  protected readonly semestre = signal(1);
  protected readonly ficha = signal<Estudiante | null>(null);
  protected readonly materias = signal<Materia[]>([]);
  protected readonly inscritas = signal<Set<number>>(new Set());
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly disponibles = computed(() => this.materias().filter((m) => !this.inscritas().has(m.id)).length);

  async ngOnInit(): Promise<void> {
    const id = this.auth.usuario()?.estudiante?.id;
    if (!id) {
      return;
    }
    try {
      const ficha = await firstValueFrom(this.api.ver<Estudiante>(`estudiantes/${id}`));
      this.ficha.set(ficha);
      this.semestre.set(Math.min(Math.max(ficha.semestre, 1), 10));
      await this.cargar();
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudieron cargar las materias.');
      this.cargando.set(false);
    }
  }

  protected cambiarSemestre(s: number): void {
    this.semestre.set(Number(s));
    this.cargar();
  }

  private async cargar(): Promise<void> {
    const e = this.ficha();
    if (!e) {
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    try {
      const [materias, inscripciones] = await Promise.all([
        firstValueFrom(this.api.todos<Materia>('materias', { carrera_id: e.carrera_id, semestre_materia: this.semestre() })),
        firstValueFrom(this.api.todos<Inscripcion>('inscripciones', { estudiante_id: e.id })),
      ]);
      this.materias.set(materias);
      this.inscritas.set(new Set(inscripciones.map((i) => i.materia_id)));
    } catch (err) {
      this.error.set(err instanceof ApiError ? err.message : 'No se pudieron cargar las materias.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected async inscribir(m: Materia): Promise<void> {
    const ok = await this.avisos.confirmar('¿Inscribirte en esta materia?', `${m.nombre} · ${m.codigo} · ${m.creditos ?? 0} créditos. Puedes darla de baja después desde Mis materias.`, 'Inscribirme');
    if (!ok) {
      return;
    }
    try {
      await firstValueFrom(this.api.crear('inscripciones', { estudiante_id: this.ficha()!.id, materia_id: m.id }));
      this.avisos.exito('Inscripción registrada.');
      await this.cargar();
    } catch (e) {
      this.avisos.error(e instanceof ApiError ? e.message : 'No se pudo inscribir.');
    }
  }
}
