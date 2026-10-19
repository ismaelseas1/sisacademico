import { Routes } from '@angular/router';

import { invitadoGuard, rolGuard, sesionGuard } from './core/guards';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login').then((m) => m.LoginPage),
    title: 'Iniciar sesión · Sistema Académico UNO',
  },
  {
    path: '',
    component: Shell,
    canActivate: [sesionGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio').then((m) => m.InicioPage),
        title: 'Inicio · Sistema Académico UNO',
      },

      // Administracion: solo admin. ":recurso" es la clave del modulo en recursos.ts.
      {
        path: 'admin/:recurso',
        canActivate: [rolGuard('admin')],
        loadComponent: () => import('./pages/recurso/recurso-page').then((m) => m.RecursoPage),
        title: 'Administración · Sistema Académico UNO',
      },

      // Proyectos: los tres roles (cada pantalla se adapta al rol).
      {
        path: 'proyectos',
        loadComponent: () => import('./pages/proyectos/proyectos').then((m) => m.ProyectosPage),
        title: 'Proyectos · Sistema Académico UNO',
      },
      {
        path: 'proyectos/nuevo',
        canActivate: [rolGuard('admin', 'estudiante')],
        loadComponent: () => import('./pages/proyectos/proyecto-form').then((m) => m.ProyectoFormPage),
        title: 'Nuevo proyecto · Sistema Académico UNO',
      },
      {
        path: 'proyectos/:id',
        loadComponent: () => import('./pages/proyectos/proyecto-detalle').then((m) => m.ProyectoDetallePage),
        title: 'Proyecto · Sistema Académico UNO',
      },
      {
        path: 'proyectos/:id/editar',
        loadComponent: () => import('./pages/proyectos/proyecto-form').then((m) => m.ProyectoFormPage),
        title: 'Editar proyecto · Sistema Académico UNO',
      },

      // Estudiante
      {
        path: 'mis-materias',
        canActivate: [rolGuard('estudiante')],
        loadComponent: () => import('./pages/estudiante/materias').then((m) => m.MisMateriasPage),
        title: 'Mis materias · Sistema Académico UNO',
      },
      {
        path: 'inscripcion',
        canActivate: [rolGuard('estudiante')],
        loadComponent: () => import('./pages/estudiante/materias').then((m) => m.InscripcionPage),
        title: 'Inscribir materia · Sistema Académico UNO',
      },

      // Docente (consulta de estudiantes) y admin (ficha)
      {
        path: 'estudiantes',
        canActivate: [rolGuard('docente')],
        loadComponent: () => import('./pages/recurso/recurso-page').then((m) => m.RecursoPage),
        data: { recurso: 'estudiantes-consulta' },
        title: 'Estudiantes · Sistema Académico UNO',
      },
      {
        path: 'estudiantes/:id',
        canActivate: [rolGuard('docente', 'admin')],
        loadComponent: () => import('./pages/ficha-estudiante').then((m) => m.FichaEstudiantePage),
        title: 'Ficha del estudiante · Sistema Académico UNO',
      },

      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil').then((m) => m.PerfilPage),
        title: 'Mi perfil · Sistema Académico UNO',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
