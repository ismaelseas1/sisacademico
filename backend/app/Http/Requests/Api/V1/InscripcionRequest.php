<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InscripcionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $inscripcionId = $this->route('inscripcion')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'estudiante_id' => [$esCreacion ? 'required' : 'sometimes', 'integer', 'exists:estudiantes,id'],
            'materia_id' => [
                $esCreacion ? 'required' : 'sometimes',
                'integer', 'exists:materias,id',
                // Un estudiante no puede inscribirse dos veces a la misma materia.
                Rule::unique('inscripciones', 'materia_id')
                    ->where(fn ($q) => $q->where('estudiante_id', $this->input('estudiante_id')))
                    ->ignore($inscripcionId),
            ],
            'fecha_inscripcion' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'materia_id.unique' => 'El estudiante ya esta inscrito en esta materia.',
        ];
    }
}
