<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\EstudianteRequest;
use App\Http\Resources\EstudianteResource;
use App\Models\Estudiante;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstudianteController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
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
     * Crea la ficha academica y la vincula a una cuenta de usuario existente.
     * El numero de registro es unico. Requiere rol admin.
     */
    public function store(EstudianteRequest $request): JsonResponse
    {
        $estudiante = Estudiante::create($request->validated());

        $this->auditoria->registrar('crear', 'estudiantes', $estudiante->id, $request->validated());

        return (new EstudianteResource($estudiante->load(['carrera', 'usuario'])))
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
     * Modifica la ficha academica. Requiere rol admin.
     */
    public function update(EstudianteRequest $request, Estudiante $estudiante): EstudianteResource
    {
        $estudiante->update($request->validated());

        $this->auditoria->registrar('actualizar', 'estudiantes', $estudiante->id, $request->validated());

        return new EstudianteResource($estudiante->load(['carrera', 'usuario']));
    }

    /**
     * Eliminar estudiante
     *
     * Elimina la ficha academica. Requiere rol admin.
     */
    public function destroy(Estudiante $estudiante): JsonResponse
    {
        $estudiante->delete();

        $this->auditoria->registrar('eliminar', 'estudiantes', $estudiante->id);

        return response()->json(['message' => 'Estudiante eliminado correctamente.']);
    }
}
