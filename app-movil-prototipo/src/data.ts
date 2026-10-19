// Datos de ejemplo con la misma forma que devuelve la API /api/v1 del backend
// (UsuarioResource, EstudianteResource, MateriaResource, ProyectoResource...).
// Los nombres salen de database/seeders/DemoSeeder.php y CarreraSeeder.php.

export type EstadoNombre = "Pendiente" | "En progreso" | "Finalizado";

export type Materia = { id: number; codigo: string; nombre: string; creditos: number; semestre_materia: number };
export type Inscripcion = { id: number; materia: Materia; fecha_inscripcion: string };
export type Estudiante = { id: number; nombre: string; registro: string; semestre: number; ppa: number; fecha_nacimiento: string; username: string };
export type Miembro = { id: number; estudiante: Estudiante; rol: string; es_lider: boolean };
export type Proyecto = {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoNombre;
  fecha_inicio: string;
  fecha_fin: string;
  tutor: string;
  autor: string;
  miembros: Miembro[];
  actualizado: string;
};

export const institucion = "Universidad Nacional del Oriente";
export const facultad = "Facultad de Ciencias de la Computación";
export const carrera = "Ingeniería de Sistemas";

// GET /estados-proyecto
export const estados: EstadoNombre[] = ["Pendiente", "En progreso", "Finalizado"];

export const estudiantes: Estudiante[] = [
  { id: 1, nombre: "Juan Pérez Rojas", registro: "2021-0451", semestre: 5, ppa: 7.85, fecha_nacimiento: "14 mar 2002", username: "jperez" },
  { id: 2, nombre: "Lucía Gutiérrez Soto", registro: "2021-0478", semestre: 5, ppa: 8.4, fecha_nacimiento: "22 jul 2002", username: "lgutierrez" },
  { id: 3, nombre: "Ricardo Mamani Choque", registro: "2020-0312", semestre: 7, ppa: 6.95, fecha_nacimiento: "05 nov 2001", username: "rmamani" },
  { id: 4, nombre: "Valeria Justiniano Paz", registro: "2022-0115", semestre: 3, ppa: 8.12, fecha_nacimiento: "30 ene 2004", username: "vjustiniano" },
  { id: 5, nombre: "Diego Añez Rivero", registro: "2021-0503", semestre: 5, ppa: 7.4, fecha_nacimiento: "18 sep 2002", username: "danez" },
];

// Estudiante que inició sesión (GET /me → usuario.estudiante)
export const yo = estudiantes[0];

// Docente que inició sesión (GET /me → usuario.docente)
export const docente = {
  nombre: "María López Vargas",
  especialidad: "Ingeniería de Software",
  facultad,
  username: "mlopez",
  email: "mlopez@uno.edu.bo",
};

// GET /inscripciones?estudiante_id=1
export const inscripciones: Inscripcion[] = [
  { id: 1, materia: { id: 1, codigo: "SIS-301", nombre: "Base de Datos II", creditos: 4, semestre_materia: 5 }, fecha_inscripcion: "10 feb 2026" },
  { id: 2, materia: { id: 2, codigo: "SIS-302", nombre: "Ingeniería de Software I", creditos: 5, semestre_materia: 5 }, fecha_inscripcion: "10 feb 2026" },
  { id: 3, materia: { id: 4, codigo: "SIS-303", nombre: "Sistemas Operativos", creditos: 4, semestre_materia: 5 }, fecha_inscripcion: "11 feb 2026" },
  { id: 4, materia: { id: 5, codigo: "MAT-305", nombre: "Investigación Operativa I", creditos: 3, semestre_materia: 5 }, fecha_inscripcion: "11 feb 2026" },
];

// GET /materias?carrera_id=1&semestre_materia=5  (las ya inscritas se marcan en la app)
export const materiasDisponibles: Materia[] = [
  { id: 1, codigo: "SIS-301", nombre: "Base de Datos II", creditos: 4, semestre_materia: 5 },
  { id: 6, codigo: "SIS-304", nombre: "Redes de Computadoras I", creditos: 4, semestre_materia: 5 },
  { id: 7, codigo: "SIS-305", nombre: "Programación Móvil", creditos: 4, semestre_materia: 5 },
  { id: 8, codigo: "ADM-310", nombre: "Gestión de Proyectos de TI", creditos: 3, semestre_materia: 5 },
];

const [juan, lucia, ricardo, valeria, diego] = estudiantes;

// GET /proyectos?estudiante_id=…  ·  GET /proyectos?tutor_id=…  ·  GET /proyectos/{id}
export const proyectos: Proyecto[] = [
  {
    id: 1,
    titulo: "Sistema de reservas de laboratorios",
    descripcion: "Aplicación web y móvil para reservar laboratorios de computación y controlar su ocupación por horario.",
    estado: "En progreso",
    fecha_inicio: "03 mar 2026",
    fecha_fin: "28 nov 2026",
    tutor: "María López Vargas",
    autor: juan.nombre,
    actualizado: "Hace 2 h",
    miembros: [
      { id: 1, estudiante: juan, rol: "Autor", es_lider: true },
      { id: 2, estudiante: lucia, rol: "Desarrollo backend", es_lider: false },
      { id: 3, estudiante: diego, rol: "Diseño UX", es_lider: false },
    ],
  },
  {
    id: 2,
    titulo: "Predicción de deserción estudiantil",
    descripcion: "Modelo de análisis de datos para detectar a tiempo a estudiantes en riesgo de abandonar la carrera.",
    estado: "Pendiente",
    fecha_inicio: "20 abr 2026",
    fecha_fin: "12 dic 2026",
    tutor: "María López Vargas",
    autor: lucia.nombre,
    actualizado: "Ayer",
    miembros: [
      { id: 4, estudiante: lucia, rol: "Autor", es_lider: true },
      { id: 5, estudiante: juan, rol: "Análisis de datos", es_lider: false },
    ],
  },
  {
    id: 3,
    titulo: "Biblioteca digital UNO",
    descripcion: "Catálogo en línea del acervo bibliográfico con préstamos y devoluciones.",
    estado: "Finalizado",
    fecha_inicio: "10 feb 2025",
    fecha_fin: "20 nov 2025",
    tutor: "María López Vargas",
    autor: ricardo.nombre,
    actualizado: "21 nov 2025",
    miembros: [
      { id: 6, estudiante: ricardo, rol: "Autor", es_lider: true },
      { id: 7, estudiante: valeria, rol: "Pruebas", es_lider: false },
    ],
  },
];

// GET /docentes (para elegir tutor)
export const docentes = ["María López Vargas", "Jorge Suárez Méndez", "Carla Roca Antelo"];

export const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const primerNombre = (nombre: string) => nombre.split(" ")[0];
