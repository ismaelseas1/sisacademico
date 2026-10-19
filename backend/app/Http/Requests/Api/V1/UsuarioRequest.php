<?php

namespace App\Http\Requests\Api\V1;

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
            'rol_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:roles,id'],
            'activo' => ['sometimes', 'boolean'],
        ];
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
