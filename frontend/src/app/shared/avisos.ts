import { Component, Injectable, inject, signal } from '@angular/core';

interface Confirmacion {
  titulo: string;
  mensaje: string;
  aceptar: string;
  peligro: boolean;
  resolver: (ok: boolean) => void;
}

/** Mensajes breves (toast) y dialogos de confirmacion propios, en lugar de alert/confirm del navegador. */
@Injectable({ providedIn: 'root' })
export class Avisos {
  readonly toast = signal<{ texto: string; error: boolean } | null>(null);
  readonly confirmacion = signal<Confirmacion | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  exito(texto: string): void {
    this.mostrar(texto, false);
  }

  error(texto: string): void {
    this.mostrar(texto, true);
  }

  confirmar(titulo: string, mensaje: string, aceptar = 'Confirmar', peligro = false): Promise<boolean> {
    return new Promise((resolver) => this.confirmacion.set({ titulo, mensaje, aceptar, peligro, resolver }));
  }

  responder(ok: boolean): void {
    this.confirmacion()?.resolver(ok);
    this.confirmacion.set(null);
  }

  private mostrar(texto: string, error: boolean): void {
    clearTimeout(this.temporizador);
    this.toast.set({ texto, error });
    this.temporizador = setTimeout(() => this.toast.set(null), error ? 6000 : 3000);
  }
}

@Component({
  selector: 'app-avisos',
  template: `
    @if (avisos.confirmacion(); as c) {
      <div class="modal-fondo" (click)="avisos.responder(false)">
        <div class="modal modal--chico" role="alertdialog" aria-modal="true" aria-labelledby="conf-titulo" (click)="$event.stopPropagation()">
          <h2 id="conf-titulo">{{ c.titulo }}</h2>
          <p class="suave">{{ c.mensaje }}</p>
          <div class="modal-acciones">
            <button type="button" class="btn btn--texto" (click)="avisos.responder(false)">Cancelar</button>
            <button type="button" class="btn" [class.btn--peligro-solido]="c.peligro" (click)="avisos.responder(true)" autofocus>
              {{ c.aceptar }}
            </button>
          </div>
        </div>
      </div>
    }
    @if (avisos.toast(); as t) {
      <div class="toast" [class.toast--error]="t.error" role="status" aria-live="polite">{{ t.texto }}</div>
    }
  `,
})
export class AvisosComponent {
  protected readonly avisos = inject(Avisos);
}
