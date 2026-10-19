# Despliegue de la API

## Por que hace falta

Durante el desarrollo la API corre con `php artisan serve` en `localhost:8000`.
`localhost` significa literalmente "esta computadora": nadie fuera de esa
maquina puede entrar, ni siquiera estando encendida. Al apagarla no queda
nada corriendo en ningun lado.

Desplegar la API resuelve dos cosas:

1. El equipo de frontend puede trabajar contra una API siempre disponible.
2. En la defensa se muestra Swagger desde una URL real, y no se depende de
   que arranque una laptop.

---

## Arquitectura elegida

| Componente | Servicio | Costo |
|---|---|---|
| API (contenedor Docker) | Render | gratis |
| Base de datos PostgreSQL | Neon | gratis |

**Por que PostgreSQL y no MySQL:** las plataformas gratuitas ofrecen
PostgreSQL de forma estable; las de MySQL suelen expirar a los 30 dias.
La imagen incluye `pdo_mysql` **y** `pdo_pgsql`, y las migraciones son
portables entre ambos, asi que cambiar de motor es solo cambiar dos
variables de entorno. En desarrollo local se sigue usando MySQL de XAMPP.

---

## Archivos que hacen posible el despliegue

| Archivo | Funcion |
|---|---|
| `backend/Dockerfile` | Imagen PHP 8.2 + Apache con las extensiones necesarias |
| `backend/docker/vhost.conf` | Apache apuntando a `public/`, con `mod_rewrite` |
| `backend/docker/php.ini` | Ajustes de produccion y OPcache |
| `backend/docker/entrypoint.sh` | Cachea configuracion, migra, siembra y arranca |
| `backend/.dockerignore` | Excluye `vendor/`, `.env`, tests |
| `render.yaml` | Blueprint: Render crea el servicio leyendo este archivo |
| `.gitattributes` | Fuerza saltos de linea LF en los scripts |

---

## Paso 1 — Base de datos en Neon

1. Entrar a https://neon.tech y crear una cuenta (no pide tarjeta).
2. Crear un proyecto llamado `sisacademico`.
3. Copiar la cadena de conexion, con esta forma:

```
postgresql://usuario:clave@ep-algo-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Guardarla: es el valor de `DB_URL`.

---

## Paso 2 — Generar la clave de aplicacion

En la maquina local, dentro de `backend/`:

```bash
php artisan key:generate --show
```

Devuelve algo como `base64:AbC123...=`. Se copia **completo, con el
prefijo `base64:`**. Es el valor de `APP_KEY`.

> Sin `APP_KEY` fija, cada reinicio del contenedor invalida los tokens
> emitidos y todos los usuarios quedan desconectados.

---

## Paso 3 — Servicio en Render

1. Entrar a https://render.com y registrarse con la cuenta de GitHub.
2. **New → Blueprint**.
3. Elegir el repositorio `ismaelseas1/sisacademico`.
4. Render detecta `render.yaml` y muestra el servicio `sisacademico-api`.
5. Pide las variables marcadas como secretas. Completar:

| Variable | Valor |
|---|---|
| `APP_KEY` | lo generado en el paso 2 |
| `APP_URL` | `https://sisacademico-api.onrender.com` |
| `DB_URL` | la cadena de Neon del paso 1 |
| `FRONTEND_URL` | `http://localhost:4200` (agregar mas separados por comas) |

6. **Apply**. La primera construccion tarda entre 5 y 10 minutos.

El contenedor, al arrancar, ejecuta solo las migraciones y carga los
catalogos, el administrador inicial y los datos de demostracion.

---

## Paso 4 — Verificar

```bash
# Estado del servicio
curl https://sisacademico-api.onrender.com/up

# Documentacion (abrir en el navegador)
https://sisacademico-api.onrender.com/docs/swagger

# Login
curl -X POST https://sisacademico-api.onrender.com/api/v1/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"identificador":"admin","password":"admin12345"}'
```

Debe devolver un token Bearer.

---

## Variables de entorno

| Variable | Valor | Nota |
|---|---|---|
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | **nunca** `true` en produccion: expone rutas y credenciales en los errores |
| `APP_KEY` | `base64:...` | fija, generada una sola vez |
| `APP_URL` | URL de Render | |
| `DB_CONNECTION` | `pgsql` | `mysql` si se usa MySQL |
| `DB_URL` | cadena de conexion | |
| `LOG_CHANNEL` | `stderr` | en contenedores los logs van a la salida estandar |
| `SESSION_DRIVER` | `file` | la API es stateless |
| `CACHE_STORE` | `file` | |
| `QUEUE_CONNECTION` | `sync` | |
| `FRONTEND_URL` | origenes separados por comas | control de CORS |
| `DOCS_PUBLIC` | `true` | expone Swagger fuera del entorno local |
| `RUN_MIGRATIONS` | `true` | migra al arrancar |
| `RUN_SEED` | `true` | catalogos y administrador |
| `RUN_DEMO_SEED` | `true` | datos de demostracion; pasar a `false` con datos reales |

---

## Advertencias

**El plan gratuito de Render suspende el servicio tras 15 minutos sin
trafico.** La siguiente peticion lo despierta, y eso tarda entre 30 y 60
segundos. **Antes de la defensa hay que abrir la URL unos minutos antes**
para que el servicio ya este despierto.

**Cambiar la contrasena del administrador.** `admin/admin12345` esta en el
repositorio, que es publico. Una vez desplegado:

```
PUT /api/v1/usuarios/1   {"password":"una-clave-larga-y-distinta"}
```

**`DOCS_PUBLIC=true` expone la documentacion a cualquiera.** Es lo buscado
para la defensa. Los endpoints siguen protegidos por token: se ve la
estructura de la API, no los datos.

---

## Despues de cada cambio

Render reconstruye solo al detectar un push a la rama `back-end-seas`.
No hay que hacer nada mas.
