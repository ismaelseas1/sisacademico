import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Api } from '../core/api';
import { Auth } from '../core/auth';
import { Estudiante } from '../core/models';
import { capitalizar, fecha, fechaConHora, iniciales, ppa } from '../shared/formato';

/** Datos de la cuenta y de la ficha academica (solo lectura: los corrige Direccion Academica). */
@Component({
  selector: 'app-perfil',
  template: `
    <div class="cabecera"><h1>Mi perfil</h1></div>

    <div class="tarjeta fila" style="gap:16px">
      <div class="avatar avatar--grande">{{ iniciales(auth.nombre()) }}</div>
      <div>
        <h2>{{ auth.nombre() }}</h2>
        <p class="suave">{{ capitalizar(auth.rol()) }} · {{ u()?.activo ? 'Cuenta activa' : 'Cuenta inactiva' }}</p>
      </div>
    </div>

    <h2 class="seccion">Cuenta</h2>
    <div class="tarjeta datos">
      <div><span class="rotulo">Usuario</span><strong>{{ u()?.username }}</strong></div>
      <div><span class="rotulo">Correo institucional</span><strong>{{ u()?.email }}</strong></div>
      <div><span class="rotulo">Último ingreso</span><strong>{{ fechaConHora(u()?.ultimo_login) }}</strong></div>
    </div>

    @if (ficha(); as e) {
      <h2 class="seccion">Ficha académica</h2>
      <div class="tarjeta datos">
        <div><span class="rotulo">Registro</span><strong>{{ e.registro }}</strong></div>
        <div><span class="rotulo">Carrera</span><strong>{{ e.carrera?.nombre }}</strong></div>
        <div><span class="rotulo">Facultad</span><strong>{{ e.carrera?.facultad?.nombre }}</strong></div>
        <div><span class="rotulo">Semestre</span><strong>{{ e.semestre }}.º semestre</strong></div>
        <div><span class="rotulo">PPA</span><strong>{{ ppa(e.ppa) }}</strong></div>
        <div><span class="rotulo">Fecha de nacimiento</span><strong>{{ fecha(e.fecha_nacimiento) }}</strong></div>
      </div>
    }

    @if (u()?.docente; as d) {
      <h2 class="seccion">Ficha docente</h2>
      <div class="tarjeta datos">
        <div><span class="rotulo">Especialidad</span><strong>{{ d.especialidad ?? '—' }}</strong></div>
        <div><span class="rotulo">Facultad</span><strong>{{ d.facultad ?? '—' }}</strong></div>
      </div>
    }

    <div class="alerta" style="margin-top:18px">🔒 Tus datos los administra Dirección Académica. Si hay un error, solicita la corrección.</div>
  `,
})
export class PerfilPage implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly api = inject(Api);

  protected readonly capitalizar = capitalizar;
  protected readonly fecha = fecha;
  protected readonly fechaConHora = fechaConHora;
  protected readonly iniciales = iniciales;
  protected readonly ppa = ppa;

  protected readonly u = computed(() => this.auth.usuario());
  protected readonly ficha = signal<Estudiante | null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.u()?.estudiante?.id;
    if (id) {
      this.ficha.set(await firstValueFrom(this.api.ver<Estudiante>(`estudiantes/${id}`)).catch(() => null));
    }
  }
}
