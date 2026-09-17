<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CarreraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $carreraId = $this->route('carrera')?->id;
        $esCreacion = $this->isMethod('POST');

        return [
            'codigo' => [
                'nullable', 'string', 'max:20',
                Rule::unique('carreras', 'codigo')->ignore($carreraId),
            ],
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:100'],
            'facultad_id' => ['nullable', 'integer', 'exists:facultades,id'],
            'institucion' => ['nullable', 'string', 'max:100'],
        ];
    }
}
