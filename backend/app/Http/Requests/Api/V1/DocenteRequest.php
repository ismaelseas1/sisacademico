<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

/** Ficha del docente y, en el mismo formulario, su cuenta de acceso (rol docente). */
class DocenteRequest extends FormRequest
{
    use ReglasCuenta;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $esCreacion = $this->isMethod('POST');

        return [
            ...$this->reglasCuenta($esCreacion, $this->route('docente')?->usuario_id),
            'nombre' => [$esCreacion ? 'required' : 'sometimes', 'string', 'max:150'],
            'especialidad' => ['nullable', 'string', 'max:100'],
            'facultad' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return $this->atributosCuenta();
    }

    public function messages(): array
    {
        return $this->mensajesCuenta();
    }
}
