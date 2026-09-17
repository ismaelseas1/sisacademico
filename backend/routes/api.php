<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CarreraController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\FacultadController;
use App\Http\Controllers\Api\V1\MateriaController;
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
    |----------------------------------------------------------------------
    | Consulta abierta a cualquier usuario autenticado
    |----------------------------------------------------------------------
    */
    Route::apiResource('facultades', FacultadController::class)
        ->parameters(['facultades' => 'facultad'])
        ->only(['index', 'show']);
    Route::apiResource('carreras', CarreraController::class)->only(['index', 'show']);
    Route::apiResource('estudiantes', EstudianteController::class)->only(['index', 'show']);
    Route::apiResource('materias', MateriaController::class)->only(['index', 'show']);

    /*
    |----------------------------------------------------------------------
    | Escritura y administracion de cuentas: solo el rol admin
    |----------------------------------------------------------------------
    */
    Route::middleware('rol:admin')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::apiResource('facultades', FacultadController::class)
            ->parameters(['facultades' => 'facultad'])
            ->except(['index', 'show']);
        Route::apiResource('carreras', CarreraController::class)->except(['index', 'show']);
        Route::apiResource('estudiantes', EstudianteController::class)->except(['index', 'show']);
        Route::apiResource('materias', MateriaController::class)->except(['index', 'show']);
    });
});
