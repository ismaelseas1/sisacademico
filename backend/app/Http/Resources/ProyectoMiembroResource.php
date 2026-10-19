<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ProyectoMiembro
 */
class ProyectoMiembroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'proyecto_id' => $this->proyecto_id,
            'estudiante_id' => $this->estudiante_id,
            'rol' => $this->rol,
            'es_lider' => $this->es_lider,
            'estudiante' => new EstudianteResource($this->whenLoaded('estudiante')),
        ];
    }
}
