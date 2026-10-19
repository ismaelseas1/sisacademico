<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identificador' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string'],
        ];
    }

    public function attributes(): array
    {
        return [
            'identificador' => 'usuario o correo',
            'password' => 'contrasena',
        ];
    }
}
