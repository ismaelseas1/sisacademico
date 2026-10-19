<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProyectoRequest;
use App\Http\Resources\ProyectoResource;
use App\Models\Proyecto;
use App\Services\ProyectoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ProyectoController extends Controller
{
    public function __construct(private ProyectoService $proyectos)
    {
    }

    /**
     * Listar proyectos
     *
     * Devuelve los proyectos paginados con su autor, tutor y estado. Permite buscar
     * por titulo y filtrar por estado, tutor, estudiante autor (estudiante_id) o
     * estudiante que integra el equipo (miembro_id).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $proyectos = Proyecto::with(['estudiante', 'tutor', 'estado'])
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where('titulo', 'like', "%{$buscar}%");
            })
            ->when($request->filled('estado_id'), fn ($q) => $q->where('estado_id', $request->integer('estado_id')))
            ->when($request->filled('tutor_id'), fn ($q) => $q->where('tutor_id', $request->integer('tutor_id')))
            ->when($request->filled('estudiante_id'), fn ($q) => $q->where('estudiante_id', $request->integer('estudiante_id')))
            ->when($request->filled('miembro_id'), fn ($q) => $q->whereHas(
                'miembros',
                fn ($m) => $m->where('estudiante_id', $request->integer('miembro_id'))
            ))
            ->latest('id')
            ->paginate($request->integer('por_pagina', 15));

        return ProyectoResource::collection($proyectos);
    }

    /**
     * Registrar proyecto
     *
     * Crea el proyecto y registra automaticamente a su autor como miembro lider
     * del equipo, dentro de una transaccion.
     */
    public function store(ProyectoRequest $request): JsonResponse
    {
        Gate::authorize('create', [Proyecto::class, $request->validated()]);

        $proyecto = $this->proyectos->crear($request->validated());

        return (new ProyectoResource($proyecto->load(['estudiante', 'tutor', 'estado', 'miembros.estudiante'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Ver proyecto
     *
     * Devuelve el proyecto con su autor, tutor, estado y la lista completa de miembros.
     */
    public function show(Proyecto $proyecto): ProyectoResource
    {
        return new ProyectoResource(
            $proyecto->load(['estudiante.carrera', 'tutor', 'estado', 'miembros.estudiante'])
        );
    }

    /**
     * Actualizar proyecto
     *
     * Modifica los datos del proyecto. La fecha de fin no puede ser anterior a la de inicio.
     */
    public function update(ProyectoRequest $request, Proyecto $proyecto): ProyectoResource
    {
        Gate::authorize('update', [$proyecto, $request->validated()]);

        $proyecto = $this->proyectos->actualizar($proyecto, $request->validated());

        return new ProyectoResource($proyecto->load(['estudiante', 'tutor', 'estado']));
    }

    /**
     * Eliminar proyecto
     *
     * Elimina el proyecto y, en cascada, sus miembros.
     */
    public function destroy(Proyecto $proyecto): JsonResponse
    {
        Gate::authorize('delete', $proyecto);

        $this->proyectos->eliminar($proyecto);

        return response()->json(['message' => 'Proyecto eliminado correctamente.']);
    }
}
