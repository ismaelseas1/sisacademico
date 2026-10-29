<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Ficha del estudiante y, en el mismo formulario, su cuenta de acceso (rol estudiante). */
class EstudianteRequest extends FormRequest
{
    use ReglasCuenta;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $estudiante = $this->route('estudiante');
        $esCreacion = $this->isMethod('POST');

        return [
            ...$this->reglasCuenta($esCreacion, $estudiante?->usuario_id),
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:150'],
            'registro' => [
                $esCreacion ? 'required' : 'sometimes',
                'string', 'max:32',
                Rule::unique('estudiantes', 'registro')->ignore($estudiante?->id),
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
            ...$this->atributosCuenta(),
            'carrera_id' => 'carrera',
            'ppa' => 'promedio ponderado acumulado',
        ];
    }

    public function messages(): array
    {
        return $this->mensajesCuenta();
    }
}
