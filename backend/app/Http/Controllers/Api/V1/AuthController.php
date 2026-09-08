<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Resources\UsuarioResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth)
    {
    }

    /**
     * Iniciar sesion
     *
     * Valida las credenciales y devuelve un token Bearer. El identificador acepta
     * indistintamente el nombre de usuario o el correo. Las cuentas inactivas
     * son rechazadas.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        ['usuario' => $usuario, 'token' => $token] = $this->auth->login(
            $request->string('identificador')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json([
            'token' => $token,
            'tipo' => 'Bearer',
            'usuario' => new UsuarioResource($usuario->load('rol')),
        ]);
    }

    /**
     * Perfil del usuario autenticado
     *
     * Devuelve el usuario del token junto con su rol y, si corresponde, su ficha
     * de estudiante o docente.
     */
    public function me(Request $request): UsuarioResource
    {
        return new UsuarioResource(
            $request->user()->load('rol')
        );
    }

    /**
     * Cerrar sesion
     *
     * Revoca unicamente el token con el que se realizo la peticion; el resto de
     * sesiones del usuario siguen activas.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());

        return response()->json(['message' => 'Sesion cerrada correctamente.']);
    }
}
