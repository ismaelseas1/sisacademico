import { Routes } from '@angular/router';

import { Login } from './pages/login/login';

import { MainLayout } from './layout/main-layout/main-layout';

import { Dashboard } from './pages/dashboard/dashboard';
import { Usuarios } from './pages/usuarios/usuarios';
import { Docentes } from './pages/docentes/docentes';
import { Estudiantes } from './pages/estudiantes/estudiantes';
import { Materias } from './pages/materias/materias';
import { Informes } from './pages/informes/informes';

import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [

  {
    path: '',
    component: Login
  },


  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'usuarios',
        component: Usuarios
      },

      {
        path: 'docentes',
        component: Docentes
      },

      {
        path: 'estudiantes',
        component: Estudiantes
      },

      {
        path: 'materias',
        component: Materias
      },

      {
        path: 'informes',
        component: Informes
      }

    ]
  },


  {
    path: '**',
    redirectTo: ''
  }

];