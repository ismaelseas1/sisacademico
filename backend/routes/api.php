<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 - Sistema Academico
|--------------------------------------------------------------------------
|
| El prefijo /api/v1 se define en bootstrap/app.php.
| La autenticacion se resuelve con tokens Bearer emitidos por Sanctum.
|
*/

Route::post('login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // La administracion de cuentas queda reservada al rol admin.
    Route::middleware('rol:admin')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
    });
});
