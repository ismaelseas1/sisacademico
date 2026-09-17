<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MateriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $materiaId = $this->route('materia')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'carrera_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:carreras,id'],
            'codigo' => [
                'nullable', 'string', 'max:20',
                Rule::unique('materias', 'codigo')->ignore($materiaId),
            ],
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:100'],
            'creditos' => ['nullable', 'integer', 'min:1', 'max:20'],
            'semestre_materia' => ['nullable', 'integer', 'min:1', 'max:20'],
        ];
    }
}
