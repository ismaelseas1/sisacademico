<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mensajes de validacion
    |--------------------------------------------------------------------------
    |
    | Traduccion al espanol de los mensajes que Laravel devuelve cuando una
    | regla de validacion falla. El marcador :attribute se reemplaza por el
    | nombre del campo, que cada Form Request define en su metodo attributes().
    |
    */

    'accepted' => 'El campo :attribute debe ser aceptado.',
    'accepted_if' => 'El campo :attribute debe ser aceptado cuando :other sea :value.',
    'active_url' => 'El campo :attribute no es una URL valida.',
    'after' => 'El campo :attribute debe ser una fecha posterior a :date.',
    'after_or_equal' => 'El campo :attribute debe ser una fecha posterior o igual a :date.',
    'alpha' => 'El campo :attribute solo puede contener letras.',
    'alpha_dash' => 'El campo :attribute solo puede contener letras, numeros, guiones y guiones bajos.',
    'alpha_num' => 'El campo :attribute solo puede contener letras y numeros.',
    'array' => 'El campo :attribute debe ser un conjunto de elementos.',
    'ascii' => 'El campo :attribute solo puede contener caracteres alfanumericos de un byte y simbolos.',
    'before' => 'El campo :attribute debe ser una fecha anterior a :date.',
    'before_or_equal' => 'El campo :attribute debe ser una fecha anterior o igual a :date.',
    'between' => [
        'array' => 'El campo :attribute debe tener entre :min y :max elementos.',
        'file' => 'El campo :attribute debe pesar entre :min y :max kilobytes.',
        'numeric' => 'El campo :attribute debe estar entre :min y :max.',
        'string' => 'El campo :attribute debe tener entre :min y :max caracteres.',
    ],
    'boolean' => 'El campo :attribute debe ser verdadero o falso.',
    'can' => 'El campo :attribute contiene un valor no autorizado.',
    'confirmed' => 'La confirmacion de :attribute no coincide.',
    'contains' => 'Al campo :attribute le falta un valor obligatorio.',
    'current_password' => 'La contrasena es incorrecta.',
    'date' => 'El campo :attribute no es una fecha valida.',
    'date_equals' => 'El campo :attribute debe ser una fecha igual a :date.',
    'date_format' => 'El campo :attribute no corresponde al formato :format.',
    'decimal' => 'El campo :attribute debe tener :decimal decimales.',
    'declined' => 'El campo :attribute debe ser rechazado.',
    'declined_if' => 'El campo :attribute debe ser rechazado cuando :other sea :value.',
    'different' => 'Los campos :attribute y :other deben ser diferentes.',
    'digits' => 'El campo :attribute debe tener :digits digitos.',
    'digits_between' => 'El campo :attribute debe tener entre :min y :max digitos.',
    'dimensions' => 'El campo :attribute tiene dimensiones de imagen no validas.',
    'distinct' => 'El campo :attribute tiene un valor duplicado.',
    'doesnt_end_with' => 'El campo :attribute no debe terminar con ninguno de los siguientes valores: :values.',
    'doesnt_start_with' => 'El campo :attribute no debe comenzar con ninguno de los siguientes valores: :values.',
    'email' => 'El campo :attribute no es un correo electronico valido.',
    'ends_with' => 'El campo :attribute debe terminar con alguno de los siguientes valores: :values.',
    'enum' => 'El valor seleccionado en :attribute no es valido.',
    'exists' => 'El valor seleccionado en :attribute no existe.',
    'extensions' => 'El campo :attribute debe tener alguna de las siguientes extensiones: :values.',
    'file' => 'El campo :attribute debe ser un archivo.',
    'filled' => 'El campo :attribute no puede estar vacio.',
    'gt' => [
        'array' => 'El campo :attribute debe tener mas de :value elementos.',
        'file' => 'El campo :attribute debe pesar mas de :value kilobytes.',
        'numeric' => 'El campo :attribute debe ser mayor que :value.',
        'string' => 'El campo :attribute debe tener mas de :value caracteres.',
    ],
    'gte' => [
        'array' => 'El campo :attribute debe tener :value elementos o mas.',
        'file' => 'El campo :attribute debe pesar :value kilobytes o mas.',
        'numeric' => 'El campo :attribute debe ser mayor o igual que :value.',
        'string' => 'El campo :attribute debe tener :value caracteres o mas.',
    ],
    'hex_color' => 'El campo :attribute debe ser un color hexadecimal valido.',
    'image' => 'El campo :attribute debe ser una imagen.',
    'in' => 'El valor seleccionado en :attribute no es valido.',
    'in_array' => 'El campo :attribute debe existir en :other.',
    'integer' => 'El campo :attribute debe ser un numero entero.',
    'ip' => 'El campo :attribute debe ser una direccion IP valida.',
    'ipv4' => 'El campo :attribute debe ser una direccion IPv4 valida.',
    'ipv6' => 'El campo :attribute debe ser una direccion IPv6 valida.',
    'json' => 'El campo :attribute debe ser una cadena JSON valida.',
    'list' => 'El campo :attribute debe ser una lista.',
    'lowercase' => 'El campo :attribute debe estar en minusculas.',
    'lt' => [
        'array' => 'El campo :attribute debe tener menos de :value elementos.',
        'file' => 'El campo :attribute debe pesar menos de :value kilobytes.',
        'numeric' => 'El campo :attribute debe ser menor que :value.',
        'string' => 'El campo :attribute debe tener menos de :value caracteres.',
    ],
    'lte' => [
        'array' => 'El campo :attribute debe tener :value elementos o menos.',
        'file' => 'El campo :attribute debe pesar :value kilobytes o menos.',
        'numeric' => 'El campo :attribute debe ser menor o igual que :value.',
        'string' => 'El campo :attribute debe tener :value caracteres o menos.',
    ],
    'mac_address' => 'El campo :attribute debe ser una direccion MAC valida.',
    'max' => [
        'array' => 'El campo :attribute no debe tener mas de :max elementos.',
        'file' => 'El campo :attribute no debe pesar mas de :max kilobytes.',
        'numeric' => 'El campo :attribute no debe ser mayor que :max.',
        'string' => 'El campo :attribute no debe tener mas de :max caracteres.',
    ],
    'max_digits' => 'El campo :attribute no debe tener mas de :max digitos.',
    'mimes' => 'El campo :attribute debe ser un archivo de tipo: :values.',
    'mimetypes' => 'El campo :attribute debe ser un archivo de tipo: :values.',
    'min' => [
        'array' => 'El campo :attribute debe tener al menos :min elementos.',
        'file' => 'El campo :attribute debe pesar al menos :min kilobytes.',
        'numeric' => 'El campo :attribute debe ser al menos :min.',
        'string' => 'El campo :attribute debe tener al menos :min caracteres.',
    ],
    'min_digits' => 'El campo :attribute debe tener al menos :min digitos.',
    'missing' => 'El campo :attribute no debe estar presente.',
    'missing_if' => 'El campo :attribute no debe estar presente cuando :other sea :value.',
    'missing_unless' => 'El campo :attribute no debe estar presente a menos que :other sea :value.',
    'missing_with' => 'El campo :attribute no debe estar presente si :values esta presente.',
    'missing_with_all' => 'El campo :attribute no debe estar presente si :values estan presentes.',
    'multiple_of' => 'El campo :attribute debe ser multiplo de :value.',
    'not_in' => 'El valor seleccionado en :attribute no es valido.',
    'not_regex' => 'El formato del campo :attribute no es valido.',
    'numeric' => 'El campo :attribute debe ser un numero.',
    'password' => [
        'letters' => 'El campo :attribute debe contener al menos una letra.',
        'mixed' => 'El campo :attribute debe contener al menos una mayuscula y una minuscula.',
        'numbers' => 'El campo :attribute debe contener al menos un numero.',
        'symbols' => 'El campo :attribute debe contener al menos un simbolo.',
        'uncompromised' => 'La :attribute indicada aparece en filtraciones de datos conocidas. Elija otra.',
    ],
    'present' => 'El campo :attribute debe estar presente.',
    'present_if' => 'El campo :attribute debe estar presente cuando :other sea :value.',
    'present_unless' => 'El campo :attribute debe estar presente a menos que :other sea :value.',
    'present_with' => 'El campo :attribute debe estar presente si :values esta presente.',
    'present_with_all' => 'El campo :attribute debe estar presente si :values estan presentes.',
    'prohibited' => 'El campo :attribute esta prohibido.',
    'prohibited_if' => 'El campo :attribute esta prohibido cuando :other sea :value.',
    'prohibited_unless' => 'El campo :attribute esta prohibido a menos que :other este en :values.',
    'prohibits' => 'El campo :attribute prohibe que :other este presente.',
    'regex' => 'El formato del campo :attribute no es valido.',
    'required' => 'El campo :attribute es obligatorio.',
    'required_array_keys' => 'El campo :attribute debe contener entradas para: :values.',
    'required_if' => 'El campo :attribute es obligatorio cuando :other sea :value.',
    'required_if_accepted' => 'El campo :attribute es obligatorio cuando :other sea aceptado.',
    'required_if_declined' => 'El campo :attribute es obligatorio cuando :other sea rechazado.',
    'required_unless' => 'El campo :attribute es obligatorio a menos que :other este en :values.',
    'required_with' => 'El campo :attribute es obligatorio cuando :values esta presente.',
    'required_with_all' => 'El campo :attribute es obligatorio cuando :values estan presentes.',
    'required_without' => 'El campo :attribute es obligatorio cuando :values no esta presente.',
    'required_without_all' => 'El campo :attribute es obligatorio cuando ninguno de :values esta presente.',
    'same' => 'Los campos :attribute y :other deben coincidir.',
    'size' => [
        'array' => 'El campo :attribute debe contener :size elementos.',
        'file' => 'El campo :attribute debe pesar :size kilobytes.',
        'numeric' => 'El campo :attribute debe ser :size.',
        'string' => 'El campo :attribute debe tener :size caracteres.',
    ],
    'starts_with' => 'El campo :attribute debe comenzar con alguno de los siguientes valores: :values.',
    'string' => 'El campo :attribute debe ser texto.',
    'timezone' => 'El campo :attribute debe ser una zona horaria valida.',
    'unique' => 'El valor del campo :attribute ya esta en uso.',
    'uploaded' => 'No se pudo subir el archivo :attribute.',
    'uppercase' => 'El campo :attribute debe estar en mayusculas.',
    'url' => 'El campo :attribute debe ser una URL valida.',
    'ulid' => 'El campo :attribute debe ser un ULID valido.',
    'uuid' => 'El campo :attribute debe ser un UUID valido.',

    /*
    |--------------------------------------------------------------------------
    | Mensajes propios del proyecto
    |--------------------------------------------------------------------------
    |
    | Aqui se sobrescribe el mensaje de una regla para un campo concreto,
    | con el formato campo.regla.
    |
    */

    'custom' => [
        'password' => [
            'min' => 'La contrasena debe tener al menos :min caracteres.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Nombres de los campos
    |--------------------------------------------------------------------------
    |
    | Reemplaza el marcador :attribute por un nombre legible. Cada Form
    | Request puede ademas definir los suyos en el metodo attributes().
    |
    */

    'attributes' => [
        'username' => 'nombre de usuario',
        'password' => 'contrasena',
        'email' => 'correo electronico',
        'rol_id' => 'rol',
        'activo' => 'estado',
        'identificador' => 'usuario o correo',
        'nombre' => 'nombre',
        'registro' => 'numero de registro',
        'carrera_id' => 'carrera',
        'facultad_id' => 'facultad',
        'materia_id' => 'materia',
        'estudiante_id' => 'estudiante',
        'usuario_id' => 'usuario',
        'semestre' => 'semestre',
        'fecha_nacimiento' => 'fecha de nacimiento',
        'ppa' => 'promedio ponderado acumulado',
        'codigo' => 'codigo',
        'creditos' => 'creditos',
    ],

];
