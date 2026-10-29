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
                $this->rolSoloAdmin(),
            ],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Las cuentas de docente y estudiante nacen y cambian junto con su ficha
     * (modulos Docentes y Estudiantes). Aqui solo se crean administradores, y a
     * una cuenta existente no se le puede pasar a docente o estudiante, ni quitar
     * ese rol, porque quedaria sin ficha o con la ficha equivocada.
     */
    private function rolSoloAdmin(): \Closure
    {
        return function (string $atributo, mixed $valor, \Closure $fallar) {
            $actual = $this->route('usuario')?->rol_id;

            if ($actual !== null && (int) $valor === (int) $actual) {
                return;
            }

            $nuevo = Rol::find($valor)?->nombre;
            $anterior = $actual !== null ? Rol::find($actual)?->nombre : null;

            if ($nuevo !== 'admin' || ($anterior !== null && $anterior !== 'admin')) {
                $fallar('Las cuentas de docentes y estudiantes se crean y editan desde los módulos Docentes y Estudiantes.');
            }
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
