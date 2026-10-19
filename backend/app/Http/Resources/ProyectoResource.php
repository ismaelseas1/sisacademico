<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Proyecto
 */
class ProyectoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'fecha_inicio' => $this->fecha_inicio?->toDateString(),
            'fecha_fin' => $this->fecha_fin?->toDateString(),
            'estudiante_id' => $this->estudiante_id,
            'tutor_id' => $this->tutor_id,
            'estado_id' => $this->estado_id,
            'estudiante' => new EstudianteResource($this->whenLoaded('estudiante')),
            'tutor' => new DocenteResource($this->whenLoaded('tutor')),
            'estado' => new EstadoProyectoResource($this->whenLoaded('estado')),
            'miembros' => ProyectoMiembroResource::collection($this->whenLoaded('miembros')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
