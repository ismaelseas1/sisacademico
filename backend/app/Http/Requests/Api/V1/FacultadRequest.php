<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class FacultadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => [$this->isMethod('POST') ? 'required' : 'sometimes', 'string', 'max:100'],
        ];
    }
}
