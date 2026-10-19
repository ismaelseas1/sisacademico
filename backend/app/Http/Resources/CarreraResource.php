<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Carrera
 */
class CarreraResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'institucion' => $this->institucion,
            'facultad_id' => $this->facultad_id,
            'facultad' => new FacultadResource($this->whenLoaded('facultad')),
            'materias' => MateriaResource::collection($this->whenLoaded('materias')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
