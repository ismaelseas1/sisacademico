import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Api, ApiError } from '../../core/api';
import { Pagina } from '../../core/models';
import { Avisos } from '../../shared/avisos';
import { leer } from '../../shared/formato';
import { Campo, Columna, OpcionesRemotas, RECURSOS, Recurso } from './recursos';

type Opcion = { valor: string | number; etiqueta: string };

/**
 * Pantalla generica de administracion: lista paginada con busqueda y filtros,
 * alta/edicion en un modal y eliminacion con confirmacion. Cada modulo se
 * describe en recursos.ts; la ruta indica cual (data: { recurso }).
 */
@Component({
  selector: 'app-recurso',
  imports: [FormsModule],
  template: `
    @if (r(); as r) {
      <div class="cabecera">
        <div>
          <h1>{{ r.titulo }}</h1>
          <p class="suave">{{ r.descripcion }}</p>
        </div>
        @if (r.crear) {
          <button class="btn" type="button" (click)="abrir(null)">＋ {{ r.femenino ? 'Nueva' : 'Nuevo' }} {{ r.singular }}</button>
        }
      </div>

      @if (r.buscar || r.filtros?.length) {
        <form class="buscador" (ngSubmit)="irAPagina(1)" role="search">
          @if (r.buscar) {
            <input name="buscar" [(ngModel)]="buscar" [placeholder]="r.buscar" [attr.aria-label]="r.buscar" />
          }
          @for (f of r.filtros ?? []; track f.parametro) {
            <select [name]="f.parametro" [(ngModel)]="filtros[f.parametro]" (ngModelChange)="irAPagina(1)" [attr.aria-label]="f.etiqueta">
              <option value="">{{ f.etiqueta }}</option>
              @for (o of opcionesDe(f); track o.valor) {
                <option [value]="o.valor">{{ o.etiqueta }}</option>
              }
            </select>
          }
          @if (r.buscar) {
            <button class="btn btn--sec" type="submit">Buscar</button>
          }
        </form>
      }

      @if (error()) {
        <div class="alerta alerta--error" role="alert">{{ error() }}</div>
      }

      <div class="tabla-caja">
        <table>
          <thead>
            <tr>
              @for (c of r.columnas; track c.titulo) {
                <th scope="col">{{ c.titulo }}</th>
              }
              @if (r.editar || r.eliminar || r.detalle) {
                <th scope="col"><span class="sr-only">Acciones</span></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (fila of filas(); track fila.id) {
              <tr>
                @for (c of r.columnas; track c.titulo) {
                  <td>
                    @if (c.clase === 'chip') {
                      <span class="chip chip--neutro">{{ celda(fila, c) }}</span>
                    } @else {
                      <span [class]="c.clase ?? ''">{{ celda(fila, c) }}</span>
                    }
                  </td>
                }
                @if (r.editar || r.eliminar || r.detalle) {
                  <td class="acciones">
                    @if (r.detalle) {
                      <button class="btn btn--sec btn--chico" type="button" (click)="verDetalle(fila)">Ver</button>
                    }
                    @if (r.editar) {
                      <button class="btn btn--sec btn--chico" type="button" (click)="abrir(fila)">Editar</button>
                    }
                    @if (r.eliminar) {
                      <button class="btn btn--peligro btn--chico" type="button" (click)="eliminar(fila)">Eliminar</button>
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="r.columnas.length + 1">
                  @if (cargando()) {
                    <div class="cargando">Cargando…</div>
                  } @else {
                    <div class="vacio"><strong>Sin resultados</strong>Prueba con otra búsqueda o filtro.</div>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (meta(); as m) {
          <div class="paginador">
            <span>{{ m.total }} {{ m.total === 1 ? r.singular : r.titulo.toLowerCase() }} · página {{ m.current_page }} de {{ m.last_page }}</span>
            <div class="fila">
              <button class="btn btn--sec btn--chico" type="button" [disabled]="m.current_page <= 1 || cargando()" (click)="irAPagina(m.current_page - 1)">‹ Anterior</button>
              <button class="btn btn--sec btn--chico" type="button" [disabled]="m.current_page >= m.last_page || cargando()" (click)="irAPagina(m.current_page + 1)">Siguiente ›</button>
            </div>
          </div>
        }
      </div>

      @if (editando() !== undefined) {
        <div class="modal-fondo" (click)="cerrar()">
          <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="guardar()" role="dialog" aria-modal="true" aria-labelledby="form-titulo" novalidate>
            <h2 id="form-titulo">{{ editando() ? 'Editar' : r.femenino ? 'Nueva' : 'Nuevo' }} {{ r.singular }}</h2>
            <p class="suave chico" style="margin-bottom:16px">Los campos con * son obligatorios.</p>
            <div class="formulario">
              @for (c of camposVisibles(); track c.nombre) {
                @if (c.tipo === 'check') {
                  <label class="campo campo--check" [class.ancho]="c.ancho">
                    <input type="checkbox" [name]="c.nombre" [(ngModel)]="valores[c.nombre]" />
                    <span>{{ c.etiqueta }}</span>
                  </label>
                } @else {
                  <label class="campo" [class.ancho]="c.ancho || c.tipo === 'textarea'">
                    <span>{{ c.etiqueta }}{{ esRequerido(c) ? ' *' : '' }}</span>
                    @switch (c.tipo) {
                      @case ('select') {
                        <select [name]="c.nombre" [(ngModel)]="valores[c.nombre]" [class.invalido]="errores()[c.nombre]">
                          <option value="">Seleccionar…</option>
                          @for (o of opcionesDe(c); track o.valor) {
                            <option [value]="o.valor">{{ o.etiqueta }}</option>
                          }
                        </select>
                      }
                      @case ('textarea') {
                        <textarea [name]="c.nombre" [(ngModel)]="valores[c.nombre]"></textarea>
                      }
                      @default {
                        <input
                          [type]="tipoInput(c)"
                          [name]="c.nombre"
                          [(ngModel)]="valores[c.nombre]"
                          [attr.min]="c.min"
                          [attr.max]="c.max"
                          [attr.step]="c.paso ?? (c.tipo === 'numero' ? 1 : null)"
                          [autocomplete]="c.tipo === 'password' ? 'new-password' : 'off'"
                          [class.invalido]="errores()[c.nombre]"
                        />
                      }
                    }
                    @if (errores()[c.nombre]) {
                      <small class="error">{{ errores()[c.nombre] }}</small>
                    } @else if (c.ayuda) {
                      <small class="ayuda">{{ c.ayuda }}</small>
                    }
                  </label>
                }
              }
            </div>
            @if (errorForm()) {
              <div class="alerta alerta--error" style="margin-top:14px" role="alert">{{ errorForm() }}</div>
            }
            <div class="modal-acciones">
              <button class="btn btn--texto" type="button" (click)="cerrar()">Cancelar</button>
              <button class="btn" type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : 'Guardar' }}</button>
            </div>
          </form>
        </div>
      }
    }
  `,
})
export class RecursoPage {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);

  /** Clave del modulo en RECURSOS (viene de la data de la ruta). */
  readonly recurso = input.required<string>();
  protected readonly r = computed<Recurso | undefined>(() => RECURSOS[this.recurso()]);

  protected buscar = '';
  protected filtros: Record<string, string> = {};
  protected valores: Record<string, any> = {};

  protected readonly filas = signal<any[]>([]);
  protected readonly meta = signal<Pagina<unknown>['meta'] | undefined>(undefined);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  /** undefined = modal cerrado; null = alta; objeto = edicion. */
  protected readonly editando = signal<any | null | undefined>(undefined);
  protected readonly guardando = signal(false);
  protected readonly errores = signal<Record<string, string>>({});
  protected readonly errorForm = signal('');
  private readonly opciones = signal<Record<string, Opcion[]>>({});
  private pagina = 1;
  /** Numero de la ultima consulta: si llega una respuesta vieja (filtro cambiado a mitad de carga) se descarta. */
  private consulta = 0;

  protected readonly camposVisibles = computed(() =>
    (this.r()?.campos ?? []).filter((c) => !(c.soloCrear && this.editando())),
  );

  constructor() {
    // Al cambiar de modulo (misma pantalla, otra ruta) se reinicia y se recarga todo.
    effect(() => {
      const r = this.r();
      this.buscar = '';
      // '' selecciona la opcion "Todos/Todas" de cada filtro.
      this.filtros = Object.fromEntries((r?.filtros ?? []).map((f) => [f.parametro, '']));
      this.filas.set([]);
      this.meta.set(undefined);
      this.editando.set(undefined);
      if (r) {
        this.cargarOpciones(r);
        this.irAPagina(1);
      }
    });
  }

  protected async irAPagina(pagina: number): Promise<void> {
    const r = this.r();
    if (!r) {
      return;
    }
    const consulta = ++this.consulta;
    this.pagina = pagina;
    this.cargando.set(true);
    this.error.set('');
    try {
      const resp = await firstValueFrom(
        this.api.listar<any>(r.ruta, { page: pagina, por_pagina: r.porPagina ?? 15, buscar: this.buscar, ...this.filtros }),
      );
      if (consulta !== this.consulta) {
        return;
      }
      this.filas.set(resp.data);
      this.meta.set(resp.meta);
    } catch (e) {
      if (consulta === this.consulta) {
        this.error.set(e instanceof ApiError ? e.message : 'No se pudo cargar la información.');
      }
    } finally {
      if (consulta === this.consulta) {
        this.cargando.set(false);
      }
    }
  }

  protected celda(fila: any, c: Columna): string {
    const v = c.valor ? c.valor(fila) : leer(fila, c.campo ?? '');
    return v === null || v === undefined || v === '' ? '—' : String(v);
  }

  protected opcionesDe(c: { remoto?: OpcionesRemotas; fijas?: Opcion[] }): Opcion[] {
    return c.fijas ?? (c.remoto ? (this.opciones()[c.remoto.ruta + JSON.stringify(c.remoto.parametros ?? {})] ?? []) : []);
  }

  protected esRequerido(c: Campo): boolean {
    return !!c.requerido && !(c.opcionalAlEditar && this.editando());
  }

  protected tipoInput(c: Campo): string {
    return { texto: 'text', email: 'email', password: 'password', numero: 'number', decimal: 'number', fecha: 'date' }[c.tipo as string] ?? 'text';
  }

  protected verDetalle(fila: any): void {
    const destino = this.r()?.detalle?.(fila);
    if (destino) {
      this.router.navigateByUrl(destino);
    }
  }

  protected abrir(fila: any | null): void {
    const valores: Record<string, any> = {};
    for (const c of this.r()?.campos ?? []) {
      const actual = fila ? (c.desde ? c.desde(fila) : fila[c.nombre]) : c.defecto;
      valores[c.nombre] = c.tipo === 'password' ? '' : (actual ?? (c.tipo === 'check' ? false : ''));
    }
    this.valores = valores;
    this.errores.set({});
    this.errorForm.set('');
    this.editando.set(fila);
  }

  protected cerrar(): void {
    this.editando.set(undefined);
  }

  protected async guardar(): Promise<void> {
    const r = this.r()!;
    const fila = this.editando();
    const faltantes: Record<string, string> = {};
    const datos: Record<string, unknown> = {};

    for (const c of this.camposVisibles()) {
      let v = this.valores[c.nombre];
      if (typeof v === 'string') {
        v = v.trim();
      }
      if (c.opcionalAlEditar && fila && v === '') {
        continue;
      }
      if (this.esRequerido(c) && (v === '' || v === null || v === undefined)) {
        faltantes[c.nombre] = 'Este campo es obligatorio.';
        continue;
      }
      if (v === '') {
        v = null;
      } else if ((c.tipo === 'numero' || c.tipo === 'decimal' || (c.tipo === 'select' && c.remoto)) && v !== null) {
        v = Number(v);
      }
      datos[c.nombre] = v;
    }

    if (Object.keys(faltantes).length) {
      this.errores.set(faltantes);
      this.errorForm.set('Completa los campos obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.errores.set({});
    this.errorForm.set('');
    try {
      if (fila) {
        await firstValueFrom(this.api.actualizar(`${r.ruta}/${fila.id}`, datos));
      } else {
        await firstValueFrom(this.api.crear(r.ruta, datos));
      }
      this.avisos.exito(fila ? 'Cambios guardados correctamente.' : 'Registro creado correctamente.');
      this.cerrar();
      await this.irAPagina(fila ? this.pagina : 1);
    } catch (e) {
      if (e instanceof ApiError) {
        this.errores.set(e.campos);
        this.errorForm.set(e.message);
      } else {
        this.errorForm.set('No se pudo guardar.');
      }
    } finally {
      this.guardando.set(false);
    }
  }

  protected async eliminar(fila: any): Promise<void> {
    const r = this.r()!;
    const nombre = fila.nombre ?? fila.username ?? fila.titulo ?? `#${fila.id}`;
    const ok = await this.avisos.confirmar(
      `¿Eliminar ${r.singular}?`,
      `Se eliminará "${nombre}". ${r.advertencia ?? 'Esta acción no se puede deshacer.'}`,
      'Eliminar',
      true,
    );
    if (!ok) {
      return;
    }
    try {
      await firstValueFrom(this.api.eliminar(`${r.ruta}/${fila.id}`));
      this.avisos.exito('Registro eliminado.');
      await this.irAPagina(this.filas().length === 1 && this.pagina > 1 ? this.pagina - 1 : this.pagina);
    } catch (e) {
      this.avisos.error(e instanceof ApiError ? e.message : 'No se pudo eliminar.');
    }
  }

  /** Carga una sola vez cada catalogo usado por filtros y selects del modulo. */
  private async cargarOpciones(r: Recurso): Promise<void> {
    const remotos = [...(r.filtros ?? []), ...r.campos].map((x) => x.remoto).filter((x): x is OpcionesRemotas => !!x);
    for (const remoto of remotos) {
      const clave = remoto.ruta + JSON.stringify(remoto.parametros ?? {});
      if (this.opciones()[clave]) {
        continue;
      }
      try {
        const lista = await firstValueFrom(this.api.todos<any>(remoto.ruta, remoto.parametros));
        this.opciones.update((o) => ({ ...o, [clave]: lista.map((x) => ({ valor: x.id, etiqueta: remoto.etiqueta(x) })) }));
      } catch {
        // Si un catalogo falla, el select queda vacio; el error principal se ve en la tabla.
      }
    }
  }
}
