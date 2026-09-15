<?php

namespace App\Services;

use App\Models\Auditoria;
use App\Models\Usuario;

/**
 * Registra el historial de acciones sobre el sistema.
 *
 * Corresponde a la tabla Auditoria del modelo: "historial de acciones
 * de los usuarios".
 */
class AuditoriaService
{
    public function registrar(
        string $accion,
        string $tabla,
        ?int $registroId = null,
        ?array $detalles = null,
        ?Usuario $usuario = null,
    ): Auditoria {
        return Auditoria::create([
            'usuario_id' => $usuario?->id ?? auth()->id(),
            'accion' => $accion,
            'tabla' => $tabla,
            'registro_id' => $registroId,
            'detalles' => $detalles ? json_encode($detalles, JSON_UNESCAPED_UNICODE) : null,
            'fecha' => now(),
        ]);
    }
}
