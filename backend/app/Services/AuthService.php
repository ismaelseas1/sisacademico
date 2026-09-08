<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    /**
     * Valida las credenciales y devuelve el usuario con su token de acceso.
     *
     * Acepta indistintamente username o email como identificador.
     *
     * @return array{usuario: Usuario, token: string}
     *
     * @throws ValidationException
     */
    public function login(string $identificador, string $password): array
    {
        $usuario = Usuario::with('rol')
            ->where('username', $identificador)
            ->orWhere('email', $identificador)
            ->first();

        if (! $usuario || ! Hash::check($password, $usuario->password)) {
            throw ValidationException::withMessages([
                'identificador' => ['Las credenciales no coinciden con nuestros registros.'],
            ]);
        }

        if (! $usuario->activo) {
            throw ValidationException::withMessages([
                'identificador' => ['La cuenta se encuentra inactiva.'],
            ]);
        }

        $usuario->forceFill(['ultimo_login' => now()])->save();

        $token = $usuario->createToken('api-token')->plainTextToken;

        $this->auditoria->registrar('login', 'usuarios', $usuario->id, null, $usuario);

        return ['usuario' => $usuario, 'token' => $token];
    }

    /** Revoca unicamente el token con el que se hizo la peticion. */
    public function logout(Usuario $usuario): void
    {
        $usuario->currentAccessToken()?->delete();

        $this->auditoria->registrar('logout', 'usuarios', $usuario->id, null, $usuario);
    }
}
