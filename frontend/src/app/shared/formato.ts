import { Proyecto } from '../core/models';

const fechaCorta = new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
const fechaHora = new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' });

/** "2026-03-03" o ISO completo -> "03 mar 2026". Las fechas sin hora se leen como locales. */
export function fecha(valor?: string | null): string {
  if (!valor) {
    return '—';
  }
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(valor);
  const d = soloFecha ? new Date(`${valor}T00:00:00`) : new Date(valor);
  return isNaN(d.getTime()) ? valor : fechaCorta.format(d);
}

export function fechaConHora(valor?: string | null): string {
  if (!valor) {
    return '—';
  }
  const d = new Date(valor);
  return isNaN(d.getTime()) ? valor : fechaHora.format(d);
}

export function iniciales(nombre?: string | null): string {
  return (nombre ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function capitalizar(texto?: string | null): string {
  return texto ? texto[0].toUpperCase() + texto.slice(1) : '';
}

export function ppa(valor?: string | number | null): string {
  return valor === null || valor === undefined || valor === '' ? '—' : Number(valor).toFixed(2);
}

export function rangoFechas(p: Pick<Proyecto, 'fecha_inicio' | 'fecha_fin'>): string {
  if (!p.fecha_inicio && !p.fecha_fin) {
    return 'Sin fechas definidas';
  }
  if (!p.fecha_fin) {
    return `Desde el ${fecha(p.fecha_inicio)}`;
  }
  if (!p.fecha_inicio) {
    return `Hasta el ${fecha(p.fecha_fin)}`;
  }
  return `${fecha(p.fecha_inicio)} — ${fecha(p.fecha_fin)}`;
}

/** Clase CSS del chip de estado: pendiente / progreso / finalizado. */
export function claseEstado(nombre?: string | null): string {
  switch (nombre) {
    case 'finalizado':
      return 'chip chip--finalizado';
    case 'en progreso':
      return 'chip chip--progreso';
    default:
      return 'chip chip--pendiente';
  }
}

/** Lee una ruta con puntos ("carrera.facultad.nombre") de un objeto. */
export function leer(objeto: unknown, ruta: string): unknown {
  return ruta.split('.').reduce<unknown>((o, k) => (o == null ? o : (o as Record<string, unknown>)[k]), objeto);
}
