// Tipos con la misma forma que los Resources de la API Laravel (/api/v1).

export type NombreRol = 'admin' | 'docente' | 'estudiante';

export interface Rol {
  id: number;
  nombre: NombreRol;
  descripcion?: string | null;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  ultimo_login?: string | null;
  created_at?: string | null;
  rol?: Rol | null;
  estudiante?: Estudiante | null;
  docente?: Docente | null;
}

export interface Facultad {
  id: number;
  nombre: string;
}

export interface Carrera {
  id: number;
  codigo?: string | null;
  nombre: string;
  institucion?: string | null;
  facultad_id?: number | null;
  facultad?: Facultad | null;
}

export interface Materia {
  id: number;
  codigo?: string | null;
  nombre: string;
  creditos?: number | null;
  semestre_materia?: number | null;
  carrera_id: number;
  carrera?: Carrera | null;
}

export interface Estudiante {
  id: number;
  nombre: string;
  registro: string;
  semestre: number;
  fecha_nacimiento?: string | null;
  ppa?: string | number | null;
  usuario_id: number;
  carrera_id: number;
  usuario?: Usuario | null;
  carrera?: Carrera | null;
  materias?: Materia[];
}

export interface Docente {
  id: number;
  nombre: string;
  especialidad?: string | null;
  facultad?: string | null;
  usuario_id: number;
  usuario?: Usuario | null;
}

export interface Inscripcion {
  id: number;
  estudiante_id: number;
  materia_id: number;
  fecha_inscripcion?: string | null;
  estudiante?: Estudiante | null;
  materia?: Materia | null;
}

export interface EstadoProyecto {
  id: number;
  nombre: string;
}

export interface ProyectoMiembro {
  id: number;
  proyecto_id: number;
  estudiante_id: number;
  rol: string;
  es_lider: boolean;
  estudiante?: Estudiante | null;
}

export interface Proyecto {
  id: number;
  titulo: string;
  descripcion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estudiante_id: number;
  tutor_id?: number | null;
  estado_id: number;
  estudiante?: Estudiante | null;
  tutor?: Docente | null;
  estado?: EstadoProyecto | null;
  miembros?: ProyectoMiembro[];
  updated_at?: string | null;
}

export interface Auditoria {
  id: number;
  usuario_id?: number | null;
  accion: string;
  tabla: string;
  registro_id?: number | null;
  detalles?: string | null;
  fecha?: string | null;
  usuario?: Usuario | null;
}

/** { data: T } */
export interface Respuesta<T> {
  data: T;
}

/** Coleccion paginada de Laravel: { data: [], meta: { ... } }. */
export interface Pagina<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
