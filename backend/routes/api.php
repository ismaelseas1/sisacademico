<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UsuarioController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\MateriaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 - Sistema Académico
|--------------------------------------------------------------------------
*/

Route::post('login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('rol:admin')->group(function () {

        Route::apiResource('usuarios', UsuarioController::class);

        Route::apiResource('estudiantes', EstudianteController::class);

        Route::apiResource('materias', MateriaController::class);

    });

});