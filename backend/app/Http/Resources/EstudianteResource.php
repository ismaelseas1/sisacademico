<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Estudiante
 */
class EstudianteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'registro' => $this->registro,
            'semestre' => $this->semestre,
            'fecha_nacimiento' => $this->fecha_nacimiento?->toDateString(),
            'ppa' => $this->ppa,
            'usuario_id' => $this->usuario_id,
            'carrera_id' => $this->carrera_id,
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
            'carrera' => new CarreraResource($this->whenLoaded('carrera')),
            'materias' => MateriaResource::collection($this->whenLoaded('materias')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
