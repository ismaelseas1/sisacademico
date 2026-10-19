# Sistema Académico UNO — Frontend web (Angular)

Rama **`front-end-seas`**: solo el frontend. El backend (API Laravel) está en la rama
`back-end-seas`.

Sistema web de la Universidad Nacional del Oriente. Consume la API REST
`https://sisacademico-api.onrender.com/api/v1` (token Bearer de Sanctum).

- Angular 20 (componentes standalone, signals, rutas con carga diferida)
- Sin librerías de UI: estilos propios con la identidad de la UNO (`src/styles.scss`)
- Adaptable a celular (menú lateral desplegable)

## Qué hace cada rol

| Rol | Pantallas |
|---|---|
| **Admin** | Panel con totales y actividad · Usuarios · Estudiantes · Docentes · Facultades · Carreras · Materias · Inscripciones · Proyectos · Auditoría (alta, edición, baja, búsqueda, filtros y paginación) |
| **Docente** | Inicio · Proyectos que tutorea (cambiar estado, gestionar equipo) · Estudiantes (consulta y ficha) · Perfil |
| **Estudiante** | Inicio · Mis materias (dar de baja) · Inscribir materia · Mis proyectos (crear, editar, equipo) · Perfil |

La administración (usuarios, roles, estructura académica) existe **solo en la web**; la app
móvil MAUI es para estudiantes y docentes.

Usuarios demo: `admin / admin12345` · `mlopez / docente123` · `jperez / estudiante123`.

## Desarrollo

```bash
cd frontend
npm install
npm start            # http://localhost:4200
```

`ng serve` usa `src/environments/environment.development.ts`. Por defecto apunta a la API de
Render; para usar el backend local cambia `apiUrl` a `http://localhost:8000/api/v1` y levanta
`php artisan serve` en `backend/`.

> La API acepta `http://localhost:4200` porque está en `FRONTEND_URL` de Render.

## Producción

```bash
cd frontend
npm run build        # dist/frontend/browser
```

### Publicar en Render (una sola vez)

1. Render → **New → Blueprint**.
2. Repositorio `ismaelseas1/sisacademico`, rama **`front-end-seas`**, Blueprint Path
   `render.yaml`.
3. **Apply**. Render crea el sitio estático **`sisacademico-web`** y lo vuelve a publicar
   con cada push a esta rama.

El backend ya acepta peticiones (CORS) de `https://sisacademico-web.onrender.com` y de la
variante con sufijo que Render asigna si el nombre está ocupado. Si se usa otro dominio, se
agrega en la variable `FRONTEND_URL` del servicio `sisacademico-api`.

## Estructura

```
frontend/src/app/
├── core/          # api.ts (HTTP + errores), auth.ts (sesión), interceptor, guards, models
├── layout/        # shell.ts: barra lateral con el menú según el rol
├── shared/        # formato.ts (fechas, iniciales, estados), avisos.ts (toast y confirmación)
└── pages/
    ├── recurso/   # CRUD genérico de administración; cada módulo se define en recursos.ts
    ├── proyectos/ # lista, detalle y formulario (se adaptan al rol)
    ├── estudiante/# mis materias e inscripción
    └── inicio, login, perfil, ficha-estudiante
```

Para agregar un módulo de administración basta con describirlo en
`pages/recurso/recursos.ts` (columnas, campos, filtros) y sumar su enlace en
`layout/shell.ts`.
