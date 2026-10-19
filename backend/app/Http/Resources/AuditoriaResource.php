<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Auditoria
 */
class AuditoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'accion' => $this->accion,
            'tabla' => $this->tabla,
            'registro_id' => $this->registro_id,
            'detalles' => $this->detalles,
            'fecha' => $this->fecha?->toIso8601String(),
            'usuario' => new UsuarioResource($this->whenLoaded('usuario')),
        ];
    }
}
