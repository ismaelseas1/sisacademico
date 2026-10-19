# Manual de instalación y uso

Sistema Académico — API REST (Laravel) + Frontend (Angular)
Repositorio: https://github.com/ismaelseas1/sisacademico

---

# Parte 1 — Levantar el backend en otra máquina

## 1.1 Programas necesarios

| Programa | Versión mínima | Cómo comprobar |
|---|---|---|
| PHP | 8.2 | `php -v` |
| Composer | 2.x | `composer -V` |
| MySQL o MariaDB | cualquiera | — |
| Git | cualquiera | `git --version` |
| Node.js | 24.15.0 (o 22.22.3) | `node -v` |

Lo más simple es instalar **XAMPP**, que trae PHP y MySQL juntos, y aparte
**Composer**, **Git** y **Node.js**.

> Si `php` o `composer` no se reconocen en la terminal, hay que agregarlos
> al PATH de Windows. Para XAMPP la ruta es `C:\xampp\php`.

## 1.2 Extensiones de PHP

La API necesita estas extensiones activas:

```
pdo_mysql   mbstring   openssl   fileinfo   zip   curl   tokenizer   xml
```

Se comprueban con `php -m`. En XAMPP vienen todas activas de fábrica.

## 1.3 Clonar el proyecto

```bash
git clone https://github.com/ismaelseas1/sisacademico.git
cd sisacademico
```

Cada integrante trabaja en su rama:

```bash
git checkout back-end-seas     # backend
git checkout front-end-rosa    # frontend
```

## 1.4 Instalar dependencias

```bash
cd backend
composer install
```

Descarga la carpeta `vendor/`, que no viaja en el repositorio.

## 1.5 Configurar el entorno

```bash
cp .env.example .env
php artisan key:generate
```

`key:generate` crea la clave con la que Laravel cifra tokens y sesiones.
**Sin este paso la aplicación no arranca.**

Abrir `.env` y revisar que la conexión coincida con la máquina:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sistemacademico
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:4200
```

> En XAMPP el usuario `root` no tiene contraseña, por eso `DB_PASSWORD`
> queda vacío. Si la instalación tiene una, hay que escribirla.

## 1.6 Crear la base de datos

Arrancar **MySQL** desde el panel de XAMPP y entrar a phpMyAdmin.

> phpMyAdmin lo sirve **Apache**, no MySQL. Si el panel muestra Apache en
> un puerto distinto del 80, la dirección lleva ese puerto:
> `http://localhost:8080/phpmyadmin/`

Crear una base llamada **`sistemacademico`** con cotejamiento
**`utf8mb4_unicode_ci`**.

También se puede por terminal:

```bash
"C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE sistemacademico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

## 1.7 Crear las tablas y los datos iniciales

```bash
php artisan migrate --seed
```

Crea las tablas y carga los tres roles del sistema (`admin`, `docente`,
`estudiante`) junto con el usuario administrador.

## 1.8 Arrancar el servidor

```bash
php artisan serve
```

La API queda en **http://localhost:8000**. Esta terminal debe quedar
abierta mientras se trabaja.

## 1.9 Comprobar que funciona

```bash
curl http://localhost:8000/up
```

Y el inicio de sesión:

```bash
curl -X POST http://localhost:8000/api/v1/login -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"identificador\":\"admin\",\"password\":\"admin12345\"}"
```

Debe devolver un token.

---

# Parte 2 — Probar la API con la documentación

## 2.1 Abrir la documentación

Con el servidor corriendo:

```
http://localhost:8000/docs/api
```

La página se genera **leyendo el código**: muestra cada endpoint con los
campos que acepta y las respuestas que devuelve, y no puede quedar
desactualizada respecto de la API.

## 2.2 Probar el inicio de sesión

1. Abrir el endpoint **POST /login**.
2. Pulsar **Try it**.
3. En el cuerpo de la petición escribir:

```json
{
  "identificador": "admin",
  "password": "admin12345"
}
```

4. Enviar. La respuesta trae el token:

```json
{
  "token": "1|abc123...",
  "tipo": "Bearer",
  "usuario": { "id": 1, "username": "admin", "rol": { "nombre": "admin" } }
}
```

## 2.3 Usar el token en el resto de endpoints

Copiar el valor de `token` y cargarlo en el botón **Auth** de la página,
como tipo **Bearer**. A partir de ahí las peticiones se envían con la
cabecera:

```
Authorization: Bearer 1|abc123...
```

Probar **GET /me**: devuelve el usuario del token.

## 2.4 Endpoints disponibles

Todas las rutas cuelgan de `/api/v1`. Salvo `login`, todas exigen el
encabezado `Authorization: Bearer <token>`.

### Sesión

| Método | Ruta | Rol requerido |
|---|---|---|
| POST | `/login` | — (público) |
| GET | `/me` | cualquiera autenticado |
| POST | `/logout` | cualquiera autenticado |

### Catálogos de solo lectura

| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/roles` | cualquiera autenticado |
| GET | `/estados-proyecto` | cualquiera autenticado |
| GET | `/auditoria` | admin |

### Estructura académica

| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/facultades` · `/facultades/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/facultades` · `/facultades/{id}` | admin |
| GET | `/carreras` · `/carreras/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/carreras` · `/carreras/{id}` | admin |
| GET | `/materias` · `/materias/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/materias` · `/materias/{id}` | admin |

### Personas

| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/usuarios` · `/usuarios/{id}` | admin |
| POST · PUT · DELETE | `/usuarios` · `/usuarios/{id}` | admin |
| GET | `/estudiantes` · `/estudiantes/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/estudiantes` · `/estudiantes/{id}` | admin |
| GET | `/docentes` · `/docentes/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/docentes` · `/docentes/{id}` | admin |

### Inscripciones

| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/inscripciones` · `/inscripciones/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/inscripciones` · `/inscripciones/{id}` | admin, estudiante |

Un estudiante no puede inscribirse dos veces en la misma materia: la API
responde 422 con el mensaje correspondiente.

### Proyectos

| Método | Ruta | Rol requerido |
|---|---|---|
| GET | `/proyectos` · `/proyectos/{id}` | cualquiera autenticado |
| POST · PUT · DELETE | `/proyectos` · `/proyectos/{id}` | admin, docente, estudiante |
| GET | `/proyectos/{id}/miembros` | cualquiera autenticado |
| POST | `/proyectos/{id}/miembros` | admin, docente, estudiante |
| DELETE | `/proyectos/{id}/miembros/{miembro}` | admin, docente, estudiante |

Al crear un proyecto, su autor queda registrado automáticamente como
miembro líder del equipo. Si después se agrega otro miembro marcado como
líder, el anterior deja de serlo: el equipo tiene un solo líder.

### Filtros y paginación

Los listados aceptan `?buscar=`, `?por_pagina=` y filtros por clave
foránea (`?carrera_id=`, `?estado_id=`, `?tutor_id=`, `?estudiante_id=`,
según el recurso). La respuesta paginada trae `data`, `links` y `meta`.

## 2.5 Probar con Postman

La documentación en formato OpenAPI está en:

```
http://localhost:8000/docs/api.json
```

En Postman: **Import → Link**, pegar esa dirección. Importa todos los
endpoints con sus ejemplos.

---

# Parte 3 — Frontend en Angular

## 3.1 Instalar Angular

Angular necesita **Node.js 24.15.0 o superior** (o la línea 22.22.3+).
Comprobar con `node -v`. Si la versión es menor, actualizar desde
https://nodejs.org

No hace falta instalar el CLI de forma global: `npx` lo descarga solo.

## 3.2 Crear el proyecto

Desde la raíz del repositorio, en la rama del frontend:

```bash
git checkout front-end-rosa
npx -p @angular/cli ng new frontend --routing --style=scss --ssr=false
cd frontend
```

## 3.3 Registrar el cliente HTTP

En `src/app/app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { tokenInterceptor } from './core/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
  ],
};
```

## 3.4 Dirección de la API

En `src/environments/environment.ts`:

```ts
export const environment = {
  produccion: false,
  apiUrl: 'http://localhost:8000/api/v1',
};
```

Así la dirección no queda repetida por todo el código y se cambia en un
solo lugar al desplegar.

## 3.5 Servicio de autenticación

`src/app/core/auth.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  rol: { id: number; nombre: string } | null;
}

interface RespuestaLogin {
  token: string;
  tipo: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly CLAVE_TOKEN = 'token';

  /** Usuario en sesión; null si no hay sesión iniciada. */
  usuario = signal<Usuario | null>(null);

  login(identificador: string, password: string) {
    return this.http
      .post<RespuestaLogin>(environment.apiUrl + '/login', { identificador, password })
      .pipe(
        tap((r) => {
          localStorage.setItem(this.CLAVE_TOKEN, r.token);
          this.usuario.set(r.usuario);
        }),
      );
  }

  logout() {
    return this.http.post(environment.apiUrl + '/logout', {}).pipe(
      tap(() => {
        localStorage.removeItem(this.CLAVE_TOKEN);
        this.usuario.set(null);
      }),
    );
  }

  /** Recupera el usuario a partir del token guardado. */
  cargarSesion() {
    return this.http
      .get<{ data: Usuario }>(environment.apiUrl + '/me')
      .pipe(tap((r) => this.usuario.set(r.data)));
  }

  get token(): string | null {
    return localStorage.getItem(this.CLAVE_TOKEN);
  }

  get autenticado(): boolean {
    return this.token !== null;
  }
}
```

## 3.6 Interceptor del token

`src/app/core/token.interceptor.ts`. Agrega la cabecera de autenticación
a cada petición, para no repetirla en cada llamada:

```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // El login no lleva token: todavía no existe.
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
    }),
  );
};
```

## 3.7 Guard de rutas

`src/app/core/auth.guard.ts`. Impide entrar a las pantallas internas sin
sesión:

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

## 3.8 Componente de inicio de sesión

`src/app/login/login.component.ts`:

```ts
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  identificador = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  enviar() {
    this.error.set('');
    this.cargando.set(true);

    this.auth.login(this.identificador, this.password).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (e) => {
        // La API responde 422 con los mensajes de validación.
        this.error.set(
          e.error?.errors?.identificador?.[0] ?? 'No se pudo iniciar sesión.',
        );
        this.cargando.set(false);
      },
    });
  }
}
```

`src/app/login/login.component.html`:

```html
<form (ngSubmit)="enviar()">
  <h1>Iniciar sesión</h1>

  <label for="identificador">Usuario o correo</label>
  <input id="identificador" name="identificador"
         [(ngModel)]="identificador" required autocomplete="username" />

  <label for="password">Contraseña</label>
  <input id="password" name="password" type="password"
         [(ngModel)]="password" required autocomplete="current-password" />

  @if (error()) {
    <p role="alert">{{ error() }}</p>
  }

  <button type="submit" [disabled]="cargando()">
    {{ cargando() ? 'Entrando...' : 'Entrar' }}
  </button>
</form>
```

## 3.9 Rutas

`src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./inicio/inicio.component').then((m) => m.InicioComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
```

## 3.10 Arrancar el frontend

```bash
ng serve
```

Queda en **http://localhost:4200**.

Para trabajar hacen falta **dos terminales abiertas**: una con
`php artisan serve` y otra con `ng serve`.

## 3.11 Credenciales de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin12345` | admin |

También se puede entrar escribiendo el correo `admin@uno.edu.bo`.

---

# Problemas frecuentes

| Síntoma | Causa | Solución |
|---|---|---|
| `SQLSTATE[HY000] [1049] Unknown database` | la base no existe | crearla en phpMyAdmin (paso 1.6) |
| `SQLSTATE[HY000] [2002]` | MySQL apagado | arrancarlo desde el panel de XAMPP |
| `No application encryption key has been specified` | falta la clave | `php artisan key:generate` |
| `Class ... not found` | falta `vendor/` | `composer install` |
| phpMyAdmin no abre | Apache en otro puerto | probar `http://localhost:8080/phpmyadmin/` |
| Angular: `Access-Control-Allow-Origin` | origen no permitido | revisar `FRONTEND_URL` en `.env` y reiniciar `php artisan serve` |
| Angular: `401 Unauthorized` | falta el token | comprobar que el interceptor esté registrado en `app.config.ts` |
| `ng: command not found` | CLI no instalado | usar `npx -p @angular/cli ng ...` |
| Angular no arranca por versión de Node | Node antiguo | actualizar a Node 24.15+ |
| Cambios en `.env` sin efecto | configuración cacheada | `php artisan config:clear` |

---

# Resumen de comandos

**Backend, primera vez:**

```bash
git clone https://github.com/ismaelseas1/sisacademico.git
cd sisacademico/backend
composer install
cp .env.example .env
php artisan key:generate
# crear la base sistemacademico en phpMyAdmin
php artisan migrate --seed
php artisan serve
```

**Backend, día a día:**

```bash
cd backend
php artisan serve
```

**Frontend, día a día:**

```bash
cd frontend
ng serve
```

| Servicio | Dirección |
|---|---|
| API | http://localhost:8000/api/v1 |
| Documentación | http://localhost:8000/docs/api |
| OpenAPI (Postman) | http://localhost:8000/docs/api.json |
| Frontend | http://localhost:4200 |
