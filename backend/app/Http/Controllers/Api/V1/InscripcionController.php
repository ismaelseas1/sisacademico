<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\InscripcionRequest;
use App\Http\Resources\InscripcionResource;
use App\Models\Inscripcion;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class InscripcionController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    /**
     * Listar inscripciones
     *
     * Devuelve las inscripciones paginadas. Permite filtrar por estudiante y por materia.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $inscripcions = Inscripcion::with(['estudiante', 'materia.carrera'])
            ->when($request->filled('estudiante_id'), fn ($q) => $q->where('estudiante_id', $request->integer('estudiante_id')))
            ->when($request->filled('materia_id'), fn ($q) => $q->where('materia_id', $request->integer('materia_id')))
            ->latest('id')
            ->paginate($request->integer('por_pagina', 15));

        return InscripcionResource::collection($inscripcions);
    }

    /**
     * Registrar inscripcion
     *
     * Inscribe a un estudiante en una materia. Un estudiante no puede
     * inscribirse dos veces a la misma materia. Si no se envia fecha, se usa la actual.
     */
    public function store(InscripcionRequest $request): JsonResponse
    {
        $datos = $request->validated();
        Gate::authorize('create', [Inscripcion::class, (int) $datos['estudiante_id']]);
        $datos['fecha_inscripcion'] ??= now();

        $inscripcion = Inscripcion::create($datos);

        $this->auditoria->registrar('crear', 'inscripciones', $inscripcion->id, $datos);

        return (new InscripcionResource($inscripcion->load(['estudiante', 'materia'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Ver inscripcion
     *
     * Devuelve la inscripcion con el estudiante y la materia.
     */
    public function show(Inscripcion $inscripcion): InscripcionResource
    {
        return new InscripcionResource($inscripcion->load(['estudiante.carrera', 'materia']));
    }

    /**
     * Actualizar inscripcion
     *
     * Modifica la inscripcion registrada.
     */
    public function update(InscripcionRequest $request, Inscripcion $inscripcion): InscripcionResource
    {
        $nuevoEstudiante = $request->validated('estudiante_id');
        Gate::authorize('update', [$inscripcion, $nuevoEstudiante === null ? null : (int) $nuevoEstudiante]);

        $inscripcion->update($request->validated());

        $this->auditoria->registrar('actualizar', 'inscripciones', $inscripcion->id, $request->validated());

        return new InscripcionResource($inscripcion->load(['estudiante', 'materia']));
    }

    /**
     * Eliminar inscripcion
     *
     * Da de baja la inscripcion del estudiante en la materia.
     */
    public function destroy(Inscripcion $inscripcion): JsonResponse
    {
        Gate::authorize('delete', $inscripcion);

        $id = $inscripcion->id;
        $inscripcion->delete();

        $this->auditoria->registrar('eliminar', 'inscripciones', $id);

        return response()->json(['message' => 'Inscripcion eliminada correctamente.']);
    }
}
