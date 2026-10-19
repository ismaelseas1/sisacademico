<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class ProyectoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $esCreacion = $this->isMethod('POST');

        return [
            'estudiante_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:estudiantes,id'],
            'tutor_id' => ['nullable', 'integer', 'exists:docentes,id'],
            'titulo' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:200'],
            'descripcion' => ['nullable', 'string'],
            'estado_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:estado_proyecto,id'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ];
    }

    public function attributes(): array
    {
        return [
            'estudiante_id' => 'estudiante',
            'tutor_id' => 'tutor',
            'estado_id' => 'estado',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
        ];
    }
}
