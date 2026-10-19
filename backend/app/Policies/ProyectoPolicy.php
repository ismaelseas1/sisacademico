<?php

namespace App\Policies;

use App\Models\EstadoProyecto;
use App\Models\Proyecto;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

/**
 * Reglas de propiedad sobre proyectos y equipos.
 *
 *   - admin: todo.
 *   - estudiante: crea proyectos propios (en estado pendiente); si es lider del
 *     equipo edita los datos y los miembros, pero no cambia el estado; solo el
 *     autor elimina el proyecto.
 *   - docente: crea proyectos que el mismo tutorea; como tutor edita el
 *     proyecto (incluido el estado) y su equipo.
 */
class ProyectoPolicy
{
    public function create(Usuario $usuario, array $datos): Response
    {
        if ($usuario->tieneRol('admin')) {
            return Response::allow();
        }

        if ($usuario->tieneRol('estudiante')) {
            if ((int) ($datos['estudiante_id'] ?? 0) !== $usuario->estudiante?->id) {
                return Response::deny('Solo puede registrar proyectos de los que usted es autor.');
            }

            return (int) ($datos['estado_id'] ?? 0) === EstadoProyecto::idPendiente()
                ? Response::allow()
                : Response::deny('Un proyecto nuevo debe iniciar en estado pendiente.');
        }

        if ($usuario->tieneRol('docente')) {
            return (int) ($datos['tutor_id'] ?? 0) === $usuario->docente?->id
                ? Response::allow()
                : Response::deny('Solo puede registrar proyectos que usted tutorea.');
        }

        return Response::deny('No tiene permisos para realizar esta accion.');
    }

    public function update(Usuario $usuario, Proyecto $proyecto, array $datos): Response
    {
        if ($usuario->tieneRol('admin') || $this->esTutor($usuario, $proyecto)) {
            return Response::allow();
        }

        if (! $this->esLider($usuario, $proyecto)) {
            return Response::deny('Solo el lider del equipo o el tutor pueden editar el proyecto.');
        }

        if (array_key_exists('estado_id', $datos) && (int) $datos['estado_id'] !== $proyecto->estado_id) {
            return Response::deny('El estado del proyecto lo cambia el docente tutor.');
        }

        if (array_key_exists('estudiante_id', $datos) && (int) $datos['estudiante_id'] !== $proyecto->estudiante_id) {
            return Response::deny('No se puede cambiar el autor del proyecto.');
        }

        return Response::allow();
    }

    public function delete(Usuario $usuario, Proyecto $proyecto): Response
    {
        if ($usuario->tieneRol('admin')) {
            return Response::allow();
        }

        return $usuario->tieneRol('estudiante') && $usuario->estudiante?->id === $proyecto->estudiante_id
            ? Response::allow()
            : Response::deny('Solo el autor puede eliminar el proyecto.');
    }

    public function gestionarMiembros(Usuario $usuario, Proyecto $proyecto): Response
    {
        if ($usuario->tieneRol('admin') || $this->esTutor($usuario, $proyecto) || $this->esLider($usuario, $proyecto)) {
            return Response::allow();
        }

        return Response::deny('Solo el lider del equipo o el tutor pueden gestionar los miembros.');
    }

    private function esTutor(Usuario $usuario, Proyecto $proyecto): bool
    {
        return $usuario->tieneRol('docente')
            && $proyecto->tutor_id !== null
            && $usuario->docente?->id === $proyecto->tutor_id;
    }

    private function esLider(Usuario $usuario, Proyecto $proyecto): bool
    {
        $estudianteId = $usuario->estudiante?->id;

        return $usuario->tieneRol('estudiante')
            && $estudianteId !== null
            && $proyecto->miembros()->where('estudiante_id', $estudianteId)->where('es_lider', true)->exists();
    }
}
