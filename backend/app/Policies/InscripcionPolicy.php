<?php

namespace App\Policies;

use App\Models\Inscripcion;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

/**
 * El estudiante solo gestiona sus propias inscripciones; el admin, todas.
 * La ruta ya limita el acceso a los roles admin y estudiante.
 */
class InscripcionPolicy
{
    public function create(Usuario $usuario, int $estudianteId): Response
    {
        return $this->esPropia($usuario, $estudianteId);
    }

    public function update(Usuario $usuario, Inscripcion $inscripcion, ?int $nuevoEstudianteId = null): Response
    {
        $propia = $this->esPropia($usuario, $inscripcion->estudiante_id);

        if ($propia->denied() || $nuevoEstudianteId === null) {
            return $propia;
        }

        return $this->esPropia($usuario, $nuevoEstudianteId);
    }

    public function delete(Usuario $usuario, Inscripcion $inscripcion): Response
    {
        return $this->esPropia($usuario, $inscripcion->estudiante_id);
    }

    private function esPropia(Usuario $usuario, int $estudianteId): Response
    {
        if ($usuario->tieneRol('admin')) {
            return Response::allow();
        }

        return $usuario->estudiante?->id === $estudianteId
            ? Response::allow()
            : Response::deny('Solo puede gestionar sus propias inscripciones.');
    }
}
