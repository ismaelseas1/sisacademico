<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $docenteId = $this->route('docente')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'usuario_id' => [
                $esCreacion ? 'required' : 'sometimes',
                'integer', 'exists:usuarios,id',
                Rule::unique('docentes', 'usuario_id')->ignore($docenteId),
            ],
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:150'],
            'especialidad' => ['nullable', 'string', 'max:100'],
            'facultad' => ['nullable', 'string', 'max:100'],
        ];
    }
}
