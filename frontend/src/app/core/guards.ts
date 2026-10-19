import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from './auth';
import { NombreRol } from './models';

/** Exige sesion iniciada (restaura la sesion guardada al recargar). */
export const sesionGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return (await auth.restaurar()) ? true : router.createUrlTree(['/login']);
};

/** Exige uno de los roles indicados; si no, vuelve al inicio del rol actual. */
export function rolGuard(...roles: NombreRol[]): CanActivateFn {
  return async () => {
    const auth = inject(Auth);
    const router = inject(Router);
    const usuario = await auth.restaurar();
    if (!usuario) {
      return router.createUrlTree(['/login']);
    }
    return roles.includes(usuario.rol?.nombre as NombreRol) ? true : router.createUrlTree(['/inicio']);
  };
}

/** Si ya hay sesion, el login lleva directo al inicio. */
export const invitadoGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return (await auth.restaurar()) ? router.createUrlTree(['/inicio']) : true;
};
