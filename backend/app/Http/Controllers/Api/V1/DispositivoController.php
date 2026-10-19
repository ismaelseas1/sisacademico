<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Dispositivo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DispositivoController extends Controller
{
    /**
     * Registrar dispositivo para notificaciones
     *
     * La app movil envia su token de Firebase Cloud Messaging despues de iniciar
     * sesion (y cada vez que Firebase lo renueva). Si el token ya estaba
     * registrado a otra cuenta, pasa al usuario actual.
     */
    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'token' => ['required', 'string', 'max:255'],
            'plataforma' => ['nullable', 'string', 'in:android,ios,windows'],
        ]);

        $dispositivo = Dispositivo::updateOrCreate(
            ['token' => $datos['token']],
            ['usuario_id' => $request->user()->id, 'plataforma' => $datos['plataforma'] ?? null],
        );

        return response()->json([
            'message' => 'Dispositivo registrado para notificaciones.',
            'id' => $dispositivo->id,
        ], $dispositivo->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Quitar dispositivo
     *
     * La app lo llama al cerrar sesion, antes de POST /logout, para que ese
     * celular deje de recibir notificaciones de la cuenta.
     */
    public function destroy(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'token' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->dispositivos()->where('token', $datos['token'])->delete();

        return response()->json(['message' => 'Dispositivo eliminado.']);
    }
}
