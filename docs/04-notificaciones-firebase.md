# Notificaciones push con Firebase

La app movil (estudiantes y docentes) consume **solo la API Laravel**: todos los
datos academicos viven en la base de datos del backend. Firebase se usa
unicamente para **enviar notificaciones push** (Firebase Cloud Messaging, FCM).

- Proyecto de Firebase: `academico-d2ff6`
- La Realtime Database (`academico-d2ff6-default-rtdb`) **no se usa**: guardar
  datos alli duplicaria la informacion del backend.

## Cuando se envia una notificacion

| Evento | Quien la recibe | `data.tipo` |
|---|---|---|
| Se crea un proyecto con tutor, o se cambia el tutor | El docente tutor | `proyecto_asignado` |
| El tutor cambia el estado del proyecto | Todos los miembros del equipo | `estado_proyecto` |
| El lider agrega a un estudiante al equipo | El estudiante agregado | `miembro_agregado` |
| El lider retira a un estudiante del equipo | El estudiante retirado | `miembro_retirado` |

Quien hace el cambio no recibe su propio aviso. Cada notificacion lleva en
`data` el `tipo` y el `proyecto_id`, para que la app abra el detalle del
proyecto al tocarla.

El envio ocurre despues de responder la peticion: si Firebase falla, la
operacion se guarda igual. Si FCM informa que un token ya no existe, se borra.

## 1. Obtener la cuenta de servicio (una sola vez)

1. Entrar a <https://console.firebase.google.com> → proyecto **academico-d2ff6**.
2. Engranaje → **Configuracion del proyecto** → pestana **Cuentas de servicio**.
3. **Generar nueva clave privada** → se descarga un `.json`.
4. Ese archivo es una **credencial secreta**: no se sube al repositorio ni se
   comparte por chat.

### En desarrollo (local)

Copiar el archivo a:

```
backend/storage/app/private/firebase-credenciales.json
```

Esa carpeta ya esta ignorada por git. El `.env` trae:

```
FIREBASE_PROJECT_ID=academico-d2ff6
FIREBASE_CREDENTIALS=storage/app/private/firebase-credenciales.json
```

Comprobar:

```powershell
php artisan tinker --execute="echo app(App\Services\FirebaseMessaging::class)->configurado() ? 'FCM listo' : 'Falta la cuenta de servicio';"
```

### En Render (produccion)

Render no guarda archivos, asi que el JSON va en una variable en base64:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\firebase-credenciales.json")) | Set-Clipboard
```

Pegar el resultado en Render → servicio `sisacademico-api` → **Environment** →
`FIREBASE_CREDENTIALS_BASE64`.

## 2. Endpoints para la app movil

Ambos requieren `Authorization: Bearer <token>`.

**Registrar el celular**: despues del login y cada vez que Firebase renueve el token.

```http
POST /api/v1/dispositivos
{ "token": "<token FCM del celular>", "plataforma": "android" }
```

Responde `201` la primera vez y `200` si el token ya existia. Si otra cuenta
inicia sesion en el mismo celular, el token pasa a la nueva cuenta.

**Quitar el celular**: al cerrar sesion, **antes** de `POST /logout`.

```http
DELETE /api/v1/dispositivos
{ "token": "<token FCM del celular>" }
```

## 3. Permisos de la API que usa la app

Ademas del rol, la API verifica de quien es cada dato (`app/Policies`):

- **Inscripciones**: el estudiante solo crea o elimina las suyas.
- **Proyectos**:
  - El estudiante crea proyectos propios, siempre en estado *pendiente*.
  - El lider del equipo edita el proyecto y sus miembros, pero no cambia el estado.
  - Solo el autor lo elimina.
  - El docente tutor edita el proyecto (incluido el estado) y su equipo.
- `GET /proyectos?miembro_id={estudiante}` devuelve los proyectos donde el
  estudiante participa, sea autor o no. Es el filtro para "Mis proyectos".

Las pruebas estan en `backend/tests/Feature/PermisosAppMovilTest.php` y
`NotificacionesTest.php` (`php artisan test`).
