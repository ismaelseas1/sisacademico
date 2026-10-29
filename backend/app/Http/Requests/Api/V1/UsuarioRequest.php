<?php

namespace App\Http\Requests\Api\V1;

use App\Models\Rol;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuarioId = $this->route('usuario')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'username' => [
                $esCreacion ? 'required' : 'sometimes',
                'string', 'max:50',
                Rule::unique('usuarios', 'username')->ignore($usuarioId),
            ],
            'email' => [
                $esCreacion ? 'required' : 'sometimes',
                'email', 'max:100',
                Rule::unique('usuarios', 'email')->ignore($usuarioId),
            ],
            'password' => [$esCreacion ? 'required' : 'sometimes', 'string', 'min:8', 'max:255'],
            'rol_id' => [
                $esCreacion ? 'required' : 'sometimes',
                'integer', 'exists:roles,id',
                $this->rolSegunFicha(),
            ],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * El rol de una cuenta lo determina su ficha: con ficha de docente es docente,
     * con ficha de estudiante es estudiante y sin ficha solo puede ser admin. Asi se
     * pueden corregir cuentas antiguas con el rol equivocado, pero no crear un
     * docente o estudiante sin ficha (eso se hace en los modulos Docentes y Estudiantes).
     */
    private function rolSegunFicha(): \Closure
    {
        return function (string $atributo, mixed $valor, \Closure $fallar) {
            $usuario = $this->route('usuario');

            // Reenviar el rol que ya tiene (al editar otros datos) siempre se acepta.
            if ($usuario !== null && (int) $valor === (int) $usuario->rol_id) {
                return;
            }

            $esperado = match (true) {
                $usuario?->docente()->exists() => 'docente',
                $usuario?->estudiante()->exists() => 'estudiante',
                default => 'admin',
            };

            if (Rol::find($valor)?->nombre === $esperado) {
                return;
            }

            $fallar(match ($esperado) {
                'docente' => 'Esta cuenta pertenece a un docente: su rol debe ser Docente.',
                'estudiante' => 'Esta cuenta pertenece a un estudiante: su rol debe ser Estudiante.',
                default => 'Esta cuenta no tiene ficha. Para un docente o estudiante, regístralo en el módulo Docentes o Estudiantes: ahí se crea su cuenta con el rol correcto.',
            });
        };
    }

    public function attributes(): array
    {
        return [
            'username' => 'nombre de usuario',
            'password' => 'contrasena',
            'rol_id' => 'rol',
        ];
    }
}
