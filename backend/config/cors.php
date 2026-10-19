<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS)
|--------------------------------------------------------------------------
|
| El frontend Angular corre en otro origen, por lo que la API debe permitir
| explicitamente sus peticiones. FRONTEND_URL acepta una lista separada por
| comas, para habilitar a la vez el entorno local de desarrollo y el
| frontend desplegado.
|
|   FRONTEND_URL=http://localhost:4200,https://sisacademico.pages.dev
|
*/

$origenes = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('FRONTEND_URL', 'http://localhost:4200'))
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origenes,

    // Frontend Angular publicado en Render (sitio estatico "sisacademico-web",
    // con o sin el sufijo que Render agrega si el nombre ya esta tomado).
    // Se puede reemplazar con FRONTEND_URL_PATTERN sin tocar el codigo.
    'allowed_origins_patterns' => [
        env('FRONTEND_URL_PATTERN', '#^https://sisacademico-web(-[a-z0-9]+)?\.onrender\.com$#'),
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // La autenticacion usa tokens Bearer, no cookies de sesion.
    'supports_credentials' => false,

];
