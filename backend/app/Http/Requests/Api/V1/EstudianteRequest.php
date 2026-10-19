<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EstudianteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $estudianteId = $this->route('estudiante')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'usuario_id' => [
                $esCreacion ? 'required' : 'sometimes',
                'integer', 'exists:usuarios,id',
                Rule::unique('estudiantes', 'usuario_id')->ignore($estudianteId),
            ],
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:150'],
            'registro' => [
                $esCreacion ? 'required' : 'sometimes',
                'string', 'max:32',
                Rule::unique('estudiantes', 'registro')->ignore($estudianteId),
            ],
            'carrera_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:carreras,id'],
            'semestre' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'min:1', 'max:20'],
            'fecha_nacimiento' => ['nullable', 'date', 'before:today'],
            'ppa' => ['nullable', 'numeric', 'min:0', 'max:9.99'],
        ];
    }

    public function attributes(): array
    {
        return [
            'usuario_id' => 'usuario',
            'carrera_id' => 'carrera',
            'ppa' => 'promedio ponderado acumulado',
        ];
    }
}
