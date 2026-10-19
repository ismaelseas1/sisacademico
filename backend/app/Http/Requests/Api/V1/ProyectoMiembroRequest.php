<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProyectoMiembroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $proyectoId = $this->route('proyecto')?->id;

        return [
            'estudiante_id' => [
                'required', 'integer', 'exists:estudiantes,id',
                Rule::unique('proyectos_miembros', 'estudiante_id')
                    ->where(fn ($q) => $q->where('proyecto_id', $proyectoId)),
            ],
            'rol' => ['required', 'string', 'max:50'],
            'es_lider' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'estudiante_id.unique' => 'El estudiante ya es miembro de este proyecto.',
        ];
    }
}
