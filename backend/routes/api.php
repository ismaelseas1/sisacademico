<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CarreraController;
use App\Http\Controllers\Api\V1\CatalogoController;
use App\Http\Controllers\Api\V1\DispositivoController;
use App\Http\Controllers\Api\V1\DocenteController;
use App\Http\Controllers\Api\V1\EstudianteController;
use App\Http\Controllers\Api\V1\FacultadController;
use App\Http\Controllers\Api\V1\InscripcionController;
use App\Http\Controllers\Api\V1\MateriaController;
use App\Http\Controllers\Api\V1\ProyectoController;
use App\Http\Controllers\Api\V1\ProyectoMiembroController;
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
|   - La estructura academica (facultades, carreras, materias) y las personas
|     (usuarios, estudiantes, docentes) solo las modifica el rol admin.
|   - Inscripciones: las gestiona admin o el propio estudiante (InscripcionPolicy).
|   - Proyectos y sus miembros: admin; el estudiante lider o autor; el docente
|     tutor (ProyectoPolicy).
|   - Dispositivos: cada usuario registra los tokens FCM de sus celulares.
|   - La auditoria es de consulta exclusiva del admin.
|
*/

Route::post('login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    // Notificaciones push de la app movil (Firebase Cloud Messaging).
    Route::post('dispositivos', [DispositivoController::class, 'store'])->name('dispositivos.store');
    Route::delete('dispositivos', [DispositivoController::class, 'destroy'])->name('dispositivos.destroy');

    /*
    |----------------------------------------------------------------------
    | Catalogos de solo lectura
    |----------------------------------------------------------------------
    */
    Route::get('roles', [CatalogoController::class, 'roles'])->name('roles.index');
    Route::get('estados-proyecto', [CatalogoController::class, 'estadosProyecto'])->name('estados-proyecto.index');

    /*
    |----------------------------------------------------------------------
    | Consulta abierta a cualquier usuario autenticado
    |----------------------------------------------------------------------
    */
    Route::apiResource('facultades', FacultadController::class)
        ->parameters(['facultades' => 'facultad'])
        ->only(['index', 'show']);
    Route::apiResource('carreras', CarreraController::class)->only(['index', 'show']);
    Route::apiResource('materias', MateriaController::class)->only(['index', 'show']);
    Route::apiResource('estudiantes', EstudianteController::class)->only(['index', 'show']);
    Route::apiResource('docentes', DocenteController::class)->only(['index', 'show']);
    Route::apiResource('inscripciones', InscripcionController::class)
        ->parameters(['inscripciones' => 'inscripcion'])
        ->only(['index', 'show']);
    Route::apiResource('proyectos', ProyectoController::class)->only(['index', 'show']);
    Route::get('proyectos/{proyecto}/miembros', [ProyectoMiembroController::class, 'index'])
        ->name('proyectos.miembros.index');

    /*
    |----------------------------------------------------------------------
    | Escritura reservada al admin
    |----------------------------------------------------------------------
    */
    Route::middleware('rol:admin')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::apiResource('facultades', FacultadController::class)
            ->parameters(['facultades' => 'facultad'])
            ->except(['index', 'show']);
        Route::apiResource('carreras', CarreraController::class)->except(['index', 'show']);
        Route::apiResource('materias', MateriaController::class)->except(['index', 'show']);
        Route::apiResource('estudiantes', EstudianteController::class)->except(['index', 'show']);
        Route::apiResource('docentes', DocenteController::class)->except(['index', 'show']);

        Route::get('auditoria', [CatalogoController::class, 'auditoria'])->name('auditoria.index');
    });

    /*
    |----------------------------------------------------------------------
    | Inscripciones: las carga el estudiante o el admin
    |----------------------------------------------------------------------
    */
    Route::middleware('rol:admin,estudiante')->group(function () {
        Route::apiResource('inscripciones', InscripcionController::class)
            ->parameters(['inscripciones' => 'inscripcion'])
            ->except(['index', 'show']);
    });

    /*
    |----------------------------------------------------------------------
    | Proyectos y equipos de trabajo
    |----------------------------------------------------------------------
    */
    Route::middleware('rol:admin,docente,estudiante')->group(function () {
        Route::apiResource('proyectos', ProyectoController::class)->except(['index', 'show']);

        Route::post('proyectos/{proyecto}/miembros', [ProyectoMiembroController::class, 'store'])
            ->name('proyectos.miembros.store');
        Route::delete('proyectos/{proyecto}/miembros/{miembro}', [ProyectoMiembroController::class, 'destroy'])
            ->name('proyectos.miembros.destroy');
    });
});
