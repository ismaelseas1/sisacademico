<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\EstudianteRequest;
use App\Http\Resources\EstudianteResource;
use App\Models\Estudiante;
use App\Services\AuditoriaService;
use App\Services\CuentaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class EstudianteController extends Controller
{
    public function __construct(private AuditoriaService $auditoria, private CuentaService $cuentas)
    {
    }

    /**
     * Listar estudiantes
     *
     * Devuelve los estudiantes paginados con su carrera y facultad. Permite buscar
     * por nombre o numero de registro y filtrar por carrera y semestre.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $estudiantes = Estudiante::with(['carrera.facultad', 'usuario.rol'])
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where(fn ($sub) => $sub->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('registro', 'like', "%{$buscar}%"));
            })
            ->when($request->filled('carrera_id'), fn ($q) => $q->where('carrera_id', $request->integer('carrera_id')))
            ->when($request->filled('semestre'), fn ($q) => $q->where('semestre', $request->integer('semestre')))
            ->orderBy('nombre')
            ->paginate($request->integer('por_pagina', 15));

        return EstudianteResource::collection($estudiantes);
    }

    /**
     * Registrar estudiante
     *
     * Crea la ficha academica junto con su cuenta de acceso (username, email,
     * password), que recibe automaticamente el rol estudiante. El numero de
     * registro es unico. Requiere rol admin.
     */
    public function store(EstudianteRequest $request): JsonResponse
    {
        $estudiante = DB::transaction(function () use ($request) {
            $usuario = $this->cuentas->crear('estudiante', $request->validated());

            return $usuario->estudiante()->create($request->safe()->except(CuentaService::CAMPOS));
        });

        $this->auditoria->registrar('crear', 'estudiantes', $estudiante->id, $request->safe()->except('password'));

        return (new EstudianteResource($estudiante->load(['carrera', 'usuario.rol'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Ver estudiante
     *
     * Devuelve el estudiante con su carrera, su cuenta y las materias en las que esta inscrito.
     */
    public function show(Estudiante $estudiante): EstudianteResource
    {
        return new EstudianteResource(
            $estudiante->load(['carrera.facultad', 'usuario.rol', 'materias'])
        );
    }

    /**
     * Actualizar estudiante
     *
     * Modifica la ficha academica y, si se envian, los datos de su cuenta
     * (la contrasena vacia no se cambia). Requiere rol admin.
     */
    public function update(EstudianteRequest $request, Estudiante $estudiante): EstudianteResource
    {
        DB::transaction(function () use ($request, $estudiante) {
            $estudiante->update($request->safe()->except(CuentaService::CAMPOS));
            $this->cuentas->actualizar($estudiante->usuario, $request->validated());
        });

        $this->auditoria->registrar('actualizar', 'estudiantes', $estudiante->id, $request->safe()->except('password'));

        return new EstudianteResource($estudiante->load(['carrera', 'usuario.rol']));
    }

    /**
     * Eliminar estudiante
     *
     * Elimina la ficha academica y desactiva su cuenta (borrado logico), para
     * que no quede un usuario estudiante sin ficha. Requiere rol admin.
     */
    public function destroy(Estudiante $estudiante): JsonResponse
    {
        DB::transaction(function () use ($estudiante) {
            $usuario = $estudiante->usuario;
            $estudiante->delete();
            $this->cuentas->eliminar($usuario);
        });

        $this->auditoria->registrar('eliminar', 'estudiantes', $estudiante->id);

        return response()->json(['message' => 'Estudiante eliminado correctamente.']);
    }
}
