<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Validation\Rule;

/**
 * Validacion de la cuenta de acceso que viaja en el formulario del docente o del
 * estudiante. Al crear es obligatoria; al editar cada campo es opcional.
 */
trait ReglasCuenta
{
    protected function reglasCuenta(bool $esCreacion, ?int $usuarioId): array
    {
        return [
            'username' => [
                $esCreacion ? 'required' : 'sometimes',
                'string', 'max:50', 'regex:/^[A-Za-z0-9._-]+$/',
                Rule::unique('usuarios', 'username')->ignore($usuarioId),
            ],
            'email' => [
                $esCreacion ? 'required' : 'sometimes',
                'email', 'max:100',
                Rule::unique('usuarios', 'email')->ignore($usuarioId),
            ],
            'password' => [$esCreacion ? 'required' : 'nullable', 'string', 'min:8', 'max:255'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    protected function atributosCuenta(): array
    {
        return [
            'username' => 'nombre de usuario',
            'password' => 'contrasena',
        ];
    }

    protected function mensajesCuenta(): array
    {
        return [
            'username.regex' => 'El nombre de usuario solo puede tener letras, numeros, punto, guion y guion bajo (sin espacios).',
        ];
    }
}
