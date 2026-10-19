<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Inscripcion
 */
class InscripcionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'estudiante_id' => $this->estudiante_id,
            'materia_id' => $this->materia_id,
            'fecha_inscripcion' => $this->fecha_inscripcion?->toIso8601String(),
            'estudiante' => new EstudianteResource($this->whenLoaded('estudiante')),
            'materia' => new MateriaResource($this->whenLoaded('materia')),
        ];
    }
}
