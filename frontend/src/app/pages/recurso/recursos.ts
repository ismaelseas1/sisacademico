import { Carrera, Estudiante, Facultad, Materia, Rol, Usuario } from '../../core/models';
import { capitalizar, fecha, fechaConHora, ppa } from '../../shared/formato';

/** Columna de la tabla: un campo (con puntos para anidados) o una funcion de formato. */
export interface Columna {
  titulo: string;
  campo?: string;
  valor?: (fila: any) => string;
  clase?: 'codigo' | 'suave' | 'chip';
}

export interface OpcionesRemotas {
  /** Ruta de la API que devuelve la coleccion (se pide con por_pagina=100). */
  ruta: string;
  parametros?: Record<string, string | number>;
  etiqueta: (x: any) => string;
}

/** Campo del formulario de alta/edicion; el nombre es el de la API. */
export interface Campo {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'email' | 'password' | 'numero' | 'decimal' | 'fecha' | 'select' | 'check' | 'textarea';
  requerido?: boolean;
  /** Solo se pide al crear (p. ej. el usuario vinculado de un estudiante). */
  soloCrear?: boolean;
  /** Al editar, si queda vacio no se envia (contrasena). */
  opcionalAlEditar?: boolean;
  remoto?: OpcionesRemotas;
  fijas?: { valor: string | number; etiqueta: string }[];
  /** Valor inicial al editar, cuando no esta en la raiz del recurso (p. ej. rol.id). */
  desde?: (fila: any) => unknown;
  min?: number;
  max?: number;
  paso?: number;
  ayuda?: string;
  ancho?: boolean;
  defecto?: unknown;
}

/** Filtro de la lista (select que se envia como parametro). */
export interface Filtro {
  parametro: string;
  etiqueta: string;
  remoto?: OpcionesRemotas;
  fijas?: { valor: string | number; etiqueta: string }[];
}

export interface Recurso {
  titulo: string;
  singular: string;
  /** Sustantivo femenino: "Nueva facultad" en vez de "Nuevo". */
  femenino?: boolean;
  descripcion: string;
  ruta: string;
  columnas: Columna[];
  campos: Campo[];
  buscar?: string;
  filtros?: Filtro[];
  crear?: boolean;
  editar?: boolean;
  eliminar?: boolean;
  /** Texto del aviso de eliminacion. */
  advertencia?: string;
  /** Ruta de detalle al hacer clic en una fila (p. ej. ficha del estudiante). */
  detalle?: (fila: any) => string;
  porPagina?: number;
}

const roles: OpcionesRemotas = { ruta: 'roles', etiqueta: (r: Rol) => capitalizar(r.nombre) };
const facultades: OpcionesRemotas = { ruta: 'facultades', etiqueta: (f: Facultad) => f.nombre };
const carreras: OpcionesRemotas = { ruta: 'carreras', etiqueta: (c: Carrera) => `${c.codigo ?? ''} · ${c.nombre}` };
const usuarios: OpcionesRemotas = {
  ruta: 'usuarios',
  etiqueta: (u: Usuario) => `${u.username} (${u.rol?.nombre ?? 'sin rol'})`,
};
const semestres = Array.from({ length: 10 }, (_, i) => ({ valor: i + 1, etiqueta: `${i + 1}.º semestre` }));

/**
 * Cuenta de acceso que se registra junto con la ficha del docente o del estudiante.
 * El rol lo pone la API segun el modulo (docente o estudiante), no se elige aqui.
 */
const camposCuenta: Campo[] = [
  {
    nombre: 'username',
    etiqueta: 'Usuario (para ingresar)',
    tipo: 'texto',
    requerido: true,
    ayuda: 'Sin espacios. Ej. jperez',
    desde: (f: { usuario?: Usuario | null }) => f.usuario?.username,
  },
  { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true, desde: (f: { usuario?: Usuario | null }) => f.usuario?.email },
  {
    nombre: 'password',
    etiqueta: 'Contraseña',
    tipo: 'password',
    requerido: true,
    opcionalAlEditar: true,
    ayuda: 'Mínimo 8 caracteres. Al editar, déjala vacía para no cambiarla.',
  },
  { nombre: 'activo', etiqueta: 'Cuenta activa', tipo: 'check', defecto: true, desde: (f: { usuario?: Usuario | null }) => f.usuario?.activo ?? true },
];

/** Modulos de administracion (solo admin, salvo "estudiantes-consulta" para el docente). */
export const RECURSOS: Record<string, Recurso> = {
  usuarios: {
    titulo: 'Usuarios',
    singular: 'usuario',
    descripcion:
      'Cuentas de acceso. Aquí se crean los administradores; las cuentas de docentes y estudiantes se crean solas al registrarlos en sus módulos.',
    ruta: 'usuarios',
    buscar: 'Buscar por usuario o correo',
    filtros: [
      { parametro: 'rol_id', etiqueta: 'Todos los roles', remoto: roles },
      { parametro: 'activo', etiqueta: 'Activos e inactivos', fijas: [{ valor: 1, etiqueta: 'Solo activos' }, { valor: 0, etiqueta: 'Solo inactivos' }] },
    ],
    columnas: [
      { titulo: 'Usuario', campo: 'username' },
      { titulo: 'Correo', campo: 'email', clase: 'suave' },
      { titulo: 'Rol', valor: (u: Usuario) => capitalizar(u.rol?.nombre), clase: 'chip' },
      { titulo: 'Estado', valor: (u: Usuario) => (u.activo ? 'Activo' : 'Inactivo') },
      { titulo: 'Último ingreso', valor: (u: Usuario) => fechaConHora(u.ultimo_login), clase: 'suave' },
    ],
    campos: [
      { nombre: 'username', etiqueta: 'Nombre de usuario', tipo: 'texto', requerido: true },
      { nombre: 'email', etiqueta: 'Correo', tipo: 'email', requerido: true },
      {
        nombre: 'rol_id',
        etiqueta: 'Rol',
        tipo: 'select',
        requerido: true,
        remoto: roles,
        desde: (u: Usuario) => u.rol?.id,
        ayuda: 'Debe coincidir con la ficha de la cuenta. Los docentes y estudiantes nuevos se registran en sus módulos.',
      },
      {
        nombre: 'password',
        etiqueta: 'Contraseña',
        tipo: 'password',
        requerido: true,
        opcionalAlEditar: true,
        ayuda: 'Mínimo 8 caracteres. Al editar, déjala vacía para no cambiarla.',
      },
      { nombre: 'activo', etiqueta: 'Cuenta activa', tipo: 'check', defecto: true },
    ],
    crear: true,
    editar: true,
    eliminar: true,
    advertencia: 'La cuenta queda desactivada (borrado lógico) y conserva su historial.',
  },

  estudiantes: {
    titulo: 'Estudiantes',
    singular: 'estudiante',
    descripcion: 'Ficha académica de cada estudiante. Al registrarlo se crea su cuenta con rol estudiante para la app y la web.',
    ruta: 'estudiantes',
    buscar: 'Buscar por nombre o registro',
    filtros: [
      { parametro: 'carrera_id', etiqueta: 'Todas las carreras', remoto: carreras },
      { parametro: 'semestre', etiqueta: 'Todos los semestres', fijas: semestres },
    ],
    columnas: [
      { titulo: 'Registro', campo: 'registro', clase: 'codigo' },
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Carrera', campo: 'carrera.nombre', clase: 'suave' },
      { titulo: 'Semestre', valor: (e: Estudiante) => `${e.semestre}.º` },
      { titulo: 'PPA', valor: (e: Estudiante) => ppa(e.ppa) },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true },
      { nombre: 'registro', etiqueta: 'Número de registro', tipo: 'texto', requerido: true },
      { nombre: 'carrera_id', etiqueta: 'Carrera', tipo: 'select', requerido: true, remoto: carreras },
      { nombre: 'semestre', etiqueta: 'Semestre', tipo: 'numero', requerido: true, min: 1, max: 20 },
      { nombre: 'fecha_nacimiento', etiqueta: 'Fecha de nacimiento', tipo: 'fecha' },
      { nombre: 'ppa', etiqueta: 'PPA', tipo: 'decimal', min: 0, max: 9.99, paso: 0.01 },
      ...camposCuenta,
    ],
    crear: true,
    editar: true,
    eliminar: true,
    detalle: (e: Estudiante) => `/estudiantes/${e.id}`,
  },

  'estudiantes-consulta': {
    titulo: 'Estudiantes',
    singular: 'estudiante',
    descripcion: 'Consulta de estudiantes. La gestión de personas la realiza Dirección Académica.',
    ruta: 'estudiantes',
    buscar: 'Buscar por nombre o registro',
    filtros: [
      { parametro: 'carrera_id', etiqueta: 'Todas las carreras', remoto: carreras },
      { parametro: 'semestre', etiqueta: 'Todos los semestres', fijas: semestres },
    ],
    columnas: [
      { titulo: 'Registro', campo: 'registro', clase: 'codigo' },
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Carrera', campo: 'carrera.nombre', clase: 'suave' },
      { titulo: 'Semestre', valor: (e: Estudiante) => `${e.semestre}.º` },
      { titulo: 'PPA', valor: (e: Estudiante) => ppa(e.ppa) },
    ],
    campos: [],
    detalle: (e: Estudiante) => `/estudiantes/${e.id}`,
  },

  docentes: {
    titulo: 'Docentes',
    singular: 'docente',
    descripcion: 'Ficha de cada docente. Al registrarlo se crea su cuenta con rol docente para la app y la web.',
    ruta: 'docentes',
    buscar: 'Buscar por nombre o especialidad',
    columnas: [
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Usuario', campo: 'usuario.username', clase: 'codigo' },
      { titulo: 'Especialidad', campo: 'especialidad', clase: 'suave' },
      { titulo: 'Facultad', campo: 'facultad', clase: 'suave' },
    ],
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre completo', tipo: 'texto', requerido: true },
      { nombre: 'especialidad', etiqueta: 'Especialidad', tipo: 'texto' },
      { nombre: 'facultad', etiqueta: 'Facultad', tipo: 'texto' },
      ...camposCuenta,
    ],
    crear: true,
    editar: true,
    eliminar: true,
  },

  facultades: {
    titulo: 'Facultades',
    singular: 'facultad',
    femenino: true,
    descripcion: 'Las facultades agrupan a las carreras.',
    ruta: 'facultades',
    buscar: 'Buscar por nombre',
    columnas: [
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Creada', valor: (f) => fecha(f.created_at), clase: 'suave' },
    ],
    campos: [{ nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true, ancho: true }],
    crear: true,
    editar: true,
    eliminar: true,
  },

  carreras: {
    titulo: 'Carreras',
    singular: 'carrera',
    femenino: true,
    descripcion: 'Cada carrera pertenece a una facultad.',
    ruta: 'carreras',
    buscar: 'Buscar por nombre o código',
    filtros: [{ parametro: 'facultad_id', etiqueta: 'Todas las facultades', remoto: facultades }],
    columnas: [
      { titulo: 'Código', campo: 'codigo', clase: 'codigo' },
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Facultad', campo: 'facultad.nombre', clase: 'suave' },
    ],
    campos: [
      { nombre: 'codigo', etiqueta: 'Código', tipo: 'texto' },
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { nombre: 'facultad_id', etiqueta: 'Facultad', tipo: 'select', remoto: facultades },
      { nombre: 'institucion', etiqueta: 'Institución', tipo: 'texto', defecto: 'Universidad Nacional del Oriente' },
    ],
    crear: true,
    editar: true,
    eliminar: true,
  },

  materias: {
    titulo: 'Materias',
    singular: 'materia',
    femenino: true,
    descripcion: 'Materias que se dictan en cada carrera.',
    ruta: 'materias',
    buscar: 'Buscar por nombre o código',
    filtros: [
      { parametro: 'carrera_id', etiqueta: 'Todas las carreras', remoto: carreras },
      { parametro: 'semestre_materia', etiqueta: 'Todos los semestres', fijas: semestres },
    ],
    columnas: [
      { titulo: 'Código', campo: 'codigo', clase: 'codigo' },
      { titulo: 'Nombre', campo: 'nombre' },
      { titulo: 'Carrera', campo: 'carrera.nombre', clase: 'suave' },
      { titulo: 'Semestre', valor: (m: Materia) => (m.semestre_materia ? `${m.semestre_materia}.º` : '—') },
      { titulo: 'Créditos', valor: (m: Materia) => String(m.creditos ?? '—') },
    ],
    campos: [
      { nombre: 'codigo', etiqueta: 'Código', tipo: 'texto' },
      { nombre: 'nombre', etiqueta: 'Nombre', tipo: 'texto', requerido: true },
      { nombre: 'carrera_id', etiqueta: 'Carrera', tipo: 'select', requerido: true, remoto: carreras },
      { nombre: 'semestre_materia', etiqueta: 'Semestre', tipo: 'numero', min: 1, max: 20 },
      { nombre: 'creditos', etiqueta: 'Créditos', tipo: 'numero', min: 1, max: 20 },
    ],
    crear: true,
    editar: true,
    eliminar: true,
  },

  inscripciones: {
    titulo: 'Inscripciones',
    singular: 'inscripción',
    femenino: true,
    descripcion: 'Estudiantes inscritos en cada materia. Un estudiante no puede inscribirse dos veces en la misma materia.',
    ruta: 'inscripciones',
    filtros: [
      { parametro: 'estudiante_id', etiqueta: 'Todos los estudiantes', remoto: { ruta: 'estudiantes', etiqueta: (e: Estudiante) => `${e.registro} · ${e.nombre}` } },
      { parametro: 'materia_id', etiqueta: 'Todas las materias', remoto: { ruta: 'materias', etiqueta: (m: Materia) => `${m.codigo ?? ''} · ${m.nombre}` } },
    ],
    columnas: [
      { titulo: 'Estudiante', campo: 'estudiante.nombre' },
      { titulo: 'Registro', campo: 'estudiante.registro', clase: 'codigo' },
      { titulo: 'Materia', valor: (i) => `${i.materia?.codigo ?? ''} · ${i.materia?.nombre ?? ''}` },
      { titulo: 'Fecha', valor: (i) => fecha(i.fecha_inscripcion), clase: 'suave' },
    ],
    campos: [
      { nombre: 'estudiante_id', etiqueta: 'Estudiante', tipo: 'select', requerido: true, remoto: { ruta: 'estudiantes', etiqueta: (e: Estudiante) => `${e.registro} · ${e.nombre}` } },
      { nombre: 'materia_id', etiqueta: 'Materia', tipo: 'select', requerido: true, remoto: { ruta: 'materias', etiqueta: (m: Materia) => `${m.codigo ?? ''} · ${m.nombre}` } },
      { nombre: 'fecha_inscripcion', etiqueta: 'Fecha de inscripción', tipo: 'fecha', ayuda: 'Si se deja vacía, se usa la fecha de hoy.', desde: (i) => i.fecha_inscripcion?.slice(0, 10) },
    ],
    crear: true,
    editar: true,
    eliminar: true,
  },

  auditoria: {
    titulo: 'Auditoría',
    singular: 'registro',
    descripcion: 'Historial de acciones de los usuarios (solo lectura).',
    ruta: 'auditoria',
    porPagina: 25,
    filtros: [
      { parametro: 'usuario_id', etiqueta: 'Todos los usuarios', remoto: usuarios },
      {
        parametro: 'accion',
        etiqueta: 'Todas las acciones',
        fijas: ['login', 'logout', 'crear', 'actualizar', 'eliminar', 'agregar_miembro', 'quitar_miembro'].map((a) => ({ valor: a, etiqueta: capitalizar(a.replace('_', ' ')) })),
      },
    ],
    columnas: [
      { titulo: 'Fecha', valor: (a) => fechaConHora(a.fecha), clase: 'suave' },
      { titulo: 'Usuario', valor: (a) => a.usuario?.username ?? (a.usuario_id ? `#${a.usuario_id}` : 'Sistema') },
      { titulo: 'Acción', valor: (a) => capitalizar(String(a.accion).replace('_', ' ')), clase: 'chip' },
      { titulo: 'Tabla', campo: 'tabla', clase: 'codigo' },
      { titulo: 'Registro', valor: (a) => (a.registro_id ? `#${a.registro_id}` : '—') },
    ],
    campos: [],
  },
};
