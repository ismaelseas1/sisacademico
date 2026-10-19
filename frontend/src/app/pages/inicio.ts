import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../core/api';
import { Auth } from '../core/auth';
import { Auditoria, Estudiante, Inscripcion, Proyecto } from '../core/models';
import { capitalizar, claseEstado, fechaConHora, iniciales, ppa, rangoFechas } from '../shared/formato';

interface Total {
  titulo: string;
  ruta: string;
  enlace: string;
  valor: number | null;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    <div class="cabecera">
      <div>
        <p class="suave">{{ saludo }},</p>
        <h1>{{ auth.nombre() }}</h1>
      </div>
    </div>

    @if (error()) {
      <div class="alerta alerta--error" role="alert">{{ error() }}</div>
    }

    @switch (auth.rol()) {
      @case ('admin') {
        <div class="grilla grilla--4">
          @for (t of totales(); track t.ruta) {
            <a class="tarjeta metrica" [routerLink]="t.enlace">
              <strong>{{ t.valor ?? '…' }}</strong>
              <span class="suave">{{ t.titulo }}</span>
            </a>
          }
        </div>

        <h2 class="seccion">Proyectos por estado</h2>
        <div class="grilla grilla--3">
          <a class="tarjeta metrica" routerLink="/proyectos"><strong>{{ porEstado('pendiente') }}</strong><span class="suave">Pendientes</span></a>
          <a class="tarjeta metrica" routerLink="/proyectos"><strong>{{ porEstado('en progreso') }}</strong><span class="suave">En progreso</span></a>
          <a class="tarjeta metrica metrica--exito" routerLink="/proyectos"><strong>{{ porEstado('finalizado') }}</strong><span class="suave">Finalizados</span></a>
        </div>

        <div class="fila fila--entre seccion">
          <h2>Actividad reciente</h2>
          <a class="btn btn--texto btn--chico" routerLink="/admin/auditoria">Ver auditoría</a>
        </div>
        <div class="tabla-caja">
          <table>
            <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Tabla</th></tr></thead>
            <tbody>
              @for (a of actividad(); track a.id) {
                <tr>
                  <td class="suave">{{ fechaConHora(a.fecha) }}</td>
                  <td>{{ a.usuario?.username ?? 'Sistema' }}</td>
                  <td><span class="chip chip--neutro">{{ capitalizar(a.accion.replace('_', ' ')) }}</span></td>
                  <td class="codigo">{{ a.tabla }}</td>
                </tr>
              } @empty {
                <tr><td colspan="4"><div class="cargando">Cargando…</div></td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @case ('docente') {
        <div class="tarjeta tarjeta--marca fila" style="gap:14px">
          <div class="avatar avatar--grande">{{ iniciales(auth.nombre()) }}</div>
          <div>
            <h2>{{ auth.usuario()?.docente?.nombre }}</h2>
            <p class="suave">{{ auth.usuario()?.docente?.especialidad }} · {{ auth.usuario()?.docente?.facultad }}</p>
          </div>
        </div>
        <h2 class="seccion">Proyectos que tutoro</h2>
        <div class="grilla grilla--3">
          <div class="tarjeta metrica"><strong>{{ porEstado('en progreso') }}</strong><span class="suave">En progreso</span></div>
          <div class="tarjeta metrica metrica--aviso"><strong>{{ porEstado('pendiente') }}</strong><span class="suave">Pendientes</span></div>
          <div class="tarjeta metrica metrica--exito"><strong>{{ porEstado('finalizado') }}</strong><span class="suave">Finalizados</span></div>
        </div>
        <div class="fila fila--entre seccion">
          <h2>Actualizados recientemente</h2>
          <a class="btn btn--texto btn--chico" routerLink="/proyectos">Ver todos</a>
        </div>
        <ng-container *ngTemplateOutlet="listaProyectos" />
      }

      @case ('estudiante') {
        @if (ficha(); as e) {
          <div class="tarjeta tarjeta--marca">
            <div class="fila" style="gap:14px">
              <div class="avatar avatar--grande">{{ iniciales(e.nombre) }}</div>
              <div>
                <h2>{{ e.nombre }}</h2>
                <p class="suave">{{ e.carrera?.nombre }} · {{ e.carrera?.facultad?.nombre }}</p>
              </div>
            </div>
            <div class="datos" style="margin-top:18px">
              <div><span class="rotulo">Registro</span><strong>{{ e.registro }}</strong></div>
              <div><span class="rotulo">Semestre</span><strong>{{ e.semestre }}.º</strong></div>
              <div><span class="rotulo">PPA</span><strong style="color:#7fffd3">{{ ppa(e.ppa) }}</strong></div>
            </div>
          </div>
        }
        <div class="grilla grilla--3 seccion">
          <a class="tarjeta metrica" routerLink="/mis-materias"><strong>{{ inscripciones().length }}</strong><span class="suave">Materias inscritas</span></a>
          <a class="tarjeta metrica" routerLink="/mis-materias"><strong>{{ creditos() }}</strong><span class="suave">Créditos</span></a>
          <a class="tarjeta metrica" routerLink="/proyectos"><strong>{{ activos().length }}</strong><span class="suave">Proyectos activos</span></a>
        </div>
        <div class="fila fila--entre seccion">
          <h2>Proyectos en curso</h2>
          <a class="btn btn--sec btn--chico" routerLink="/inscripcion">＋ Inscribir materia</a>
        </div>
        <ng-container *ngTemplateOutlet="listaProyectos" />
      }
    }

    <ng-template #listaProyectos>
      <div class="lista">
        @for (p of recientes(); track p.id) {
          <a class="tarjeta item" [routerLink]="['/proyectos', p.id]">
            <div class="avatar">📁</div>
            <div class="item__cuerpo">
              <strong>{{ p.titulo }}</strong>
              <span class="suave chico">{{ auth.rol() === 'docente' ? 'Autor: ' + (p.estudiante?.nombre ?? '') : 'Tutor: ' + (p.tutor?.nombre ?? 'sin asignar') }} · {{ rangoFechas(p) }}</span>
            </div>
            <span [class]="claseEstado(p.estado?.nombre)">{{ capitalizar(p.estado?.nombre) }}</span>
          </a>
        } @empty {
          <div class="tarjeta vacio">
            @if (cargando()) { <div class="cargando">Cargando…</div> } @else { <strong>No hay proyectos activos</strong> }
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class InicioPage implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly api = inject(Api);

  protected readonly capitalizar = capitalizar;
  protected readonly claseEstado = claseEstado;
  protected readonly fechaConHora = fechaConHora;
  protected readonly iniciales = iniciales;
  protected readonly ppa = ppa;
  protected readonly rangoFechas = rangoFechas;

  protected readonly saludo = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly proyectos = signal<Proyecto[]>([]);
  protected readonly actividad = signal<Auditoria[]>([]);
  protected readonly ficha = signal<Estudiante | null>(null);
  protected readonly inscripciones = signal<Inscripcion[]>([]);
  protected readonly totales = signal<Total[]>([
    { titulo: 'Usuarios', ruta: 'usuarios', enlace: '/admin/usuarios', valor: null },
    { titulo: 'Estudiantes', ruta: 'estudiantes', enlace: '/admin/estudiantes', valor: null },
    { titulo: 'Docentes', ruta: 'docentes', enlace: '/admin/docentes', valor: null },
    { titulo: 'Carreras', ruta: 'carreras', enlace: '/admin/carreras', valor: null },
    { titulo: 'Materias', ruta: 'materias', enlace: '/admin/materias', valor: null },
    { titulo: 'Inscripciones', ruta: 'inscripciones', enlace: '/admin/inscripciones', valor: null },
    { titulo: 'Proyectos', ruta: 'proyectos', enlace: '/proyectos', valor: null },
    { titulo: 'Facultades', ruta: 'facultades', enlace: '/admin/facultades', valor: null },
  ]);

  protected readonly activos = computed(() => this.proyectos().filter((p) => p.estado?.nombre !== 'finalizado'));
  protected readonly creditos = computed(() => this.inscripciones().reduce((s, i) => s + (i.materia?.creditos ?? 0), 0));
  protected readonly recientes = computed(() => {
    const lista = this.auth.rol() === 'estudiante' ? this.activos() : this.proyectos();
    return [...lista].sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? '')).slice(0, 5);
  });

  protected porEstado(nombre: string): number {
    return this.proyectos().filter((p) => p.estado?.nombre === nombre).length;
  }

  async ngOnInit(): Promise<void> {
    const u = this.auth.usuario();
    try {
      if (u?.rol?.nombre === 'admin') {
        await this.cargarAdmin();
      } else if (u?.docente) {
        this.proyectos.set(await firstValueFrom(this.api.todos<Proyecto>('proyectos', { tutor_id: u.docente.id })));
      } else if (u?.estudiante) {
        const id = u.estudiante.id;
        const [ficha, inscripciones, proyectos] = await Promise.all([
          firstValueFrom(this.api.ver<Estudiante>(`estudiantes/${id}`)),
          firstValueFrom(this.api.todos<Inscripcion>('inscripciones', { estudiante_id: id })),
          firstValueFrom(this.api.todos<Proyecto>('proyectos', { miembro_id: id })),
        ]);
        this.ficha.set(ficha);
        this.inscripciones.set(inscripciones);
        this.proyectos.set(proyectos);
      }
    } catch (e) {
      this.error.set(e instanceof ApiError ? e.message : 'No se pudo cargar el inicio.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarAdmin(): Promise<void> {
    const totales = await Promise.all(
      this.totales().map(async (t) => ({ ...t, valor: (await firstValueFrom(this.api.listar(t.ruta, { por_pagina: 1 }))).meta?.total ?? 0 })),
    );
    this.totales.set(totales);
    this.proyectos.set(await firstValueFrom(this.api.todos<Proyecto>('proyectos')));
    this.actividad.set((await firstValueFrom(this.api.listar<Auditoria>('auditoria', { por_pagina: 6 }))).data);
  }
}
