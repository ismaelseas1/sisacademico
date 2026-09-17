<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Usuario
 */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'activo' => $this->activo,
            'ultimo_login' => $this->ultimo_login?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'rol' => new RolResource($this->whenLoaded('rol')),
        ];
    }
}
