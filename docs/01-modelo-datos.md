# Modelo de datos académico — lectura del PDF

Fuente: `Modelo_Base_Academico.pdf` (2 páginas: diagrama ER + explicación).
El PDF define la **fuente única de verdad** compartida por los 4 grupos:
Backend REST, Backend GraphQL, Frontend Angular, Frontend React.

> Nuestro rol: **Backend REST (Laravel)** + **Frontend Angular**.

---

## 1. Tablas del diagrama (12)

Los tipos del diagrama son de SQL Server (`nvarchar`, `datetime2`, `bit`).
Abajo va la equivalencia a migraciones de Laravel/MySQL.

### Bloque: Seguridad

| Tabla | Campos (diagrama) | Equivalente Laravel |
|---|---|---|
| **Roles** | id bigint PK · nombre varchar(50) · descripcion nvarchar(255)? | `id()` · `string('nombre',50)` · `string('descripcion',255)->nullable()` |
| **Usuarios** | id bigint PK · username varchar(50) · password varchar(255) · email varchar(100) · rol_id bigint FK→Roles · activo bit · ultimo_login datetime2? · created_at datetime2? · deleted_at datetime2? | `id()` · `string('username',50)->unique()` · `string('password')` · `string('email',100)->unique()` · `foreignId('rol_id')` · `boolean('activo')->default(true)` · `timestamp('ultimo_login')->nullable()` · `timestamps()` · `softDeletes()` |
| **Auditoria** | id bigint PK · usuario_id bigint? FK→Usuarios · accion nvarchar(255) · tabla nvarchar(50) · registro_id bigint? · detalles nvarchar(max)? · fecha datetime2 | `id()` · `foreignId('usuario_id')->nullable()` · `string('accion',255)` · `string('tabla',50)` · `unsignedBigInteger('registro_id')->nullable()` · `text('detalles')->nullable()` · `timestamp('fecha')` |

### Bloque: Estructura académica

| Tabla | Campos (diagrama) | Notas |
|---|---|---|
| **Facultades** | id bigint PK · nombre nvarchar(100) · created_at? · updated_at? | agrupa carreras |
| **Carreras** | id bigint PK · codigo varchar · nombre nvarchar(100) · facultad_id bigint? FK→Facultades · institucion nvarchar(100)? · created_at · updated_at | |
| **Materias** | id bigint PK · carrera_id bigint FK→Carreras · codigo varchar · nombre nvarchar(100) · creditos int? · semestre_materia int? · created_at · updated_at | |

### Bloque: Personas

| Tabla | Campos (diagrama) | Notas |
|---|---|---|
| **Estudiantes** | id bigint PK · usuario_id bigint FK→Usuarios · nombre nvarchar(150) · registro varchar(32) · carrera_id bigint FK→Carreras · semestre int · fecha_nacimiento date? · ppa decimal(3,2)? · created_at · updated_at | `registro` debe ser único |
| **Docentes** | id bigint PK · usuario_id bigint FK→Usuarios · nombre nvarchar(150) · especialidad nvarchar(100)? · facultad nvarchar(100)? · created_at · updated_at | ojo: `facultad` aquí es **texto**, no FK |

### Bloque: Inscripciones

| Tabla | Campos (diagrama) | Notas |
|---|---|---|
| **Inscripciones** | id bigint PK · estudiante_id bigint FK · materia_id bigint FK · fecha_inscripcion datetime2? | N:M clásica estudiante↔materia. Conviene `unique(estudiante_id, materia_id)` |

### Bloque: Proyectos

| Tabla | Campos (diagrama) | Notas |
|---|---|---|
| **EstadoProyecto** | id **int** PK · nombre varchar(20) | catálogo: pendiente / en progreso / finalizado |
| **Proyectos** | id bigint PK · estudiante_id bigint FK · tutor_id bigint? FK→Docentes · titulo nvarchar(200) · descripcion nvarchar(max)? · estado_id int FK→EstadoProyecto · fecha_inicio date? · fecha_fin date? · created_at? · updated_at? | ⚠️ en el diagrama la tarjeta dice **"Mostrar más"**: puede haber columnas extra que el PDF no muestra |
| **ProyectosMiembros** | id bigint PK · proyecto_id bigint FK · estudiante_id bigint FK · rol nvarchar(50) · es_lider bit | varios estudiantes por proyecto, con rol y líder |

---

## 2. Grafo de relaciones

```
Roles 1──N Usuarios 1──N Auditoria
                │
                ├──1:1 Estudiantes ──N:1 Carreras ──N:1 Facultades
                │            │                          
                │            ├──N Inscripciones N── Materias ──N:1 Carreras
                │            ├──N Proyectos (como autor)
                │            └──N ProyectosMiembros N── Proyectos
                │
                └──1:1 Docentes ──1:N Proyectos (como tutor)

EstadoProyecto 1──N Proyectos
```

---

## 3. Puntos a confirmar con el equipo (dudas del PDF)

1. **Proyectos** aparece truncado ("Mostrar más") → faltan posibles columnas.
2. `Usuarios` no tiene `updated_at` en el diagrama, sí `deleted_at` (soft delete).
3. `Docentes.facultad` es texto libre en vez de FK a `Facultades` → ¿se deja así por compatibilidad con los otros grupos, o se normaliza?
4. `Carreras.codigo` y `Materias.codigo` no muestran longitud → asumimos `varchar(20)`.
5. `EstadoProyecto.id` es `int` (no bigint) → la FK `Proyectos.estado_id` debe ser `unsignedInteger`, no `foreignId`.
6. **Nombres de tabla**: el diagrama usa PascalCase (`Usuarios`, `ProyectosMiembros`), pero MariaDB en Windows corre con `lower_case_table_names=1` y **guarda todo en minúscula**. Si un integrante trabaja en Linux (case-sensitive) la BD compartida se rompe. → Se adopta `snake_case` minúscula: `usuarios`, `proyectos_miembros`, `estado_proyecto`. **Debe ratificarse con los otros 3 grupos.**

---

## 4. Endpoints REST que pide el PDF (mínimo)

- `/usuarios`
- `/estudiantes`
- `/proyectos`

Ya están implementados, junto con el resto de las tablas del modelo:
`/facultades`, `/carreras`, `/materias`, `/docentes`, `/inscripciones`,
`/proyectos` (con `/proyectos/{id}/miembros`), más los catálogos `/roles`,
`/estados-proyecto` y `/auditoria`. El detalle de métodos y permisos por rol
está en `docs/03-manual-instalacion.md`, sección 2.4.
