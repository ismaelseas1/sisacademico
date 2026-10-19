import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../../core/api';
import { Auth } from '../../core/auth';
import { EstadoProyecto, Proyecto } from '../../core/models';
import { capitalizar, claseEstado, rangoFechas } from '../../shared/formato';

/**
 * Lista de proyectos segun el rol:
 *   - admin: todos, con busqueda y filtro por estado;
 *   - docente: los que tutorea;
 *   - estudiante: aquellos donde integra el equipo (miembro_id), activos / finalizados.
 */
@Component({
  selector: 'app-proyectos',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="cabecera">
      <div>
        <h1>{{ titulo() }}</h1>
        <p class="suave">{{ descripcion() }}</p>
      </div>
      @if (auth.rol() !== 'docente') {
        <a class="btn" routerLink="/proyectos/nuevo">＋ Nuevo proyecto</a>
      }
    </div>

    <div class="buscador">
      @if (auth.rol() === 'admin') {
        <input [(ngModel)]="buscar" (keyup.enter)="cargar()" placeholder="Buscar por título" aria-label="Buscar por título" />
        <button class="btn btn--sec" type="button" (click)="cargar()">Buscar</button>
      }
      <select [(ngModel)]="estado" aria-label="Filtrar por estado">
        <option value="">Todos los estados</option>
        @for (e of estados(); track e.id) {
          <option [value]="e.nombre">{{ capitalizar(e.nombre) }}</option>
        }
      </select>
    </div>

    @if (error()) {
      <div class="alerta alerta--error" role="alert">{{ error() }}</div>
    }
    @if (cargando()) {
      <div class="cargando">Cargando proyectos…</div>
    }

    <div class="grilla grilla--2">
      @for (p of visibles(); track p.id) {
        <a class="tarjeta proyecto" [routerLink]="['/proyectos', p.id]">
          <div class="fila fila--entre">
            <div class="avatar">📁</div>
            <span [class]="claseEstado(p.estado?.nombre)">{{ capitalizar(p.estado?.nombre) }}</span>
          </div>
          <h3>{{ p.titulo }}</h3>
          <span class="suave chico">Autor: {{ p.estudiante?.nombre ?? '—' }}</span>
          <span class="suave chico">Tutor: {{ p.tutor?.nombre ?? 'sin asignar' }}</span>
          <span class="suave chico">📅 {{ rangoFechas(p) }}</span>
        </a>
      } @empty {
        @if (!cargando()) {
          <div class="tarjeta vacio" style="grid-column:1/-1">
            <strong>No hay proyectos</strong>
            {{ auth.rol() === 'estudiante' ? 'Crea uno nuevo y empieza a colaborar con tu equipo.' : 'Cambia el filtro para ver otros proyectos.' }}
          </div>
        }
      }
    </div>
  `,
})
export class ProyectosPage implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly api = inject(Api);

  protected readonly capitalizar = capitalizar;
  protected readonly claseEstado = claseEstado;
  protected readonly rangoFechas = rangoFechas;

  protected buscar = '';
  private readonly estadoSel = signal('');
  protected get estado(): string {
    return this.estadoSel();
  }
  protected set estado(v: string) {
    this.estadoSel.set(v);
  }

  protected readonly proyectos = signal<Proyecto[]>([]);
  protected readonly estados = signal<EstadoProyecto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected readonly visibles = computed(() =>
    this.proyectos().filter((p) => !this.estadoSel() || p.estado?.nombre === this.estadoSel()),
  );
  protected readonly titulo = computed(() =>
    ({ admin: 'Proyectos', docente: 'Proyectos que tutoro', estudiante: 'Mis proyectos' })[this.auth.rol() ?? 'estudiante'],
  );
  protected readonly descripcion = computed(() =>
    ({
      admin: 'Todos los proyectos académicos con su autor, tutor y estado.',
      docente: 'Proyectos en los que eres tutor. Desde el detalle puedes cambiar su estado.',
      estudiante: 'Proyectos en los que participas, como autor o como miembro del equipo.',
    })[this.auth.rol() ?? 'estudiante'],
  );

  async ngOnInit(): Promise<void> {
    this.estados.set(await firstValueFrom(this.api.todos<EstadoProyecto>('estados-proyecto')).catch(() => []));
    await this.cargar();
  }

  protected async cargar(): Promise<void> {
    const u = this.auth.usuario();
    const filtro =
      u?.rol?.nombre === 'docente' ? { tutor_id: u.docente?.id } : u?.rol?.nombre === 'estudiante' ? { miembro_id: u.estudiante?.id } : { buscar: this.buscar };

    this.cargando.set(true);
    this.error.set('');
    try {
      this.proyectos.set(await firstValueFrom(this.api.todos<Proyecto>('proyectos', filtro)));
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudieron cargar los proyectos.');
    } finally {
      this.cargando.set(false);
    }
  }
}
