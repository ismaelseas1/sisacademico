<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restringe una ruta a los roles indicados.
 *
 * Uso: ->middleware('rol:admin,docente')
 */
class VerificarRol
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $usuario = $request->user();

        if (! $usuario || ! $usuario->tieneRol(...$roles)) {
            return response()->json([
                'message' => 'No tiene permisos para realizar esta accion.',
            ], 403);
        }

        return $next($request);
    }
}
