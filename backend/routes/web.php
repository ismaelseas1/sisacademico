<?php

use Illuminate\Support\Facades\Route;

/*
 * Se usa Route::redirect y Route::view en lugar de closures para que
 * `php artisan route:cache` pueda serializar las rutas en produccion.
 */
Route::redirect('/', '/docs/swagger');

/*
 * Swagger UI sobre el documento OpenAPI que genera Scramble.
 * Scramble sirve ademas su propia interfaz en /docs/api y el
 * documento crudo en /docs/api.json
 */
Route::view('/docs/swagger', 'docs.swagger')->name('docs.swagger');
