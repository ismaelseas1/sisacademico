import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  console.log('Token encontrado:', token);

  if (token) {
    return true;
  }

  router.navigate(['/']);

  return false;

};