<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\MateriaController;
use App\Http\Controllers\Api\V1\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 - Sistema Académico
|--------------------------------------------------------------------------
|
| El prefijo /api/v1 se define en bootstrap/app.php.
| La autenticación se resuelve con tokens Bearer emitidos por Sanctum.
|
| Criterio de permisos:
|   - Consultar (index/show) lo puede hacer cualquier usuario autenticado.
|   - Crear, editar y eliminar queda reservado al rol admin.
|
*/

Route::post('login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Consulta abierta a cualquier usuario autenticado
    |--------------------------------------------------------------------------
    */
    Route::apiResource('estudiantes', EstudianteController::class)->only(['index', 'show']);
    Route::apiResource('materias', MateriaController::class)->only(['index', 'show']);

    /*
    |--------------------------------------------------------------------------
    | Administración: solo rol admin
    |--------------------------------------------------------------------------
    */
    Route::middleware('rol:admin')->group(function () {

        Route::apiResource('usuarios', UsuarioController::class);

        Route::apiResource('estudiantes', EstudianteController::class)
            ->except(['index', 'show']);

        Route::apiResource('materias', MateriaController::class)
            ->except(['index', 'show']);

    });

});