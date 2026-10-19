<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CarreraRequest;
use App\Http\Resources\CarreraResource;
use App\Models\Carrera;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CarreraController extends Controller
{
    /**
     * Listar carreras
     *
     * Devuelve las carreras paginadas con su facultad. Permite buscar por nombre o codigo.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $carreras = Carrera::with('facultad')
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where(fn ($sub) => $sub->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('codigo', 'like', "%{$buscar}%"));
            })
            ->when($request->filled('facultad_id'), fn ($q) => $q->where('facultad_id', $request->integer('facultad_id')))
            ->orderBy('nombre')
            ->paginate($request->integer('por_pagina', 15));

        return CarreraResource::collection($carreras);
    }

    /**
     * Registrar carrera
     *
     * Crea una carrera dentro de una facultad. El codigo es unico. Requiere rol admin.
     */
    public function store(CarreraRequest $request): JsonResponse
    {
        $carrera = Carrera::create($request->validated());

        return (new CarreraResource($carrera->load('facultad')))->response()->setStatusCode(201);
    }

    /**
     * Ver carrera
     *
     * Devuelve la carrera con su facultad y su plan de materias.
     */
    public function show(Carrera $carrera): CarreraResource
    {
        return new CarreraResource($carrera->load(['facultad', 'materias']));
    }

    /**
     * Actualizar carrera
     *
     * Modifica los datos de la carrera. Requiere rol admin.
     */
    public function update(CarreraRequest $request, Carrera $carrera): CarreraResource
    {
        $carrera->update($request->validated());

        return new CarreraResource($carrera->load('facultad'));
    }

    /**
     * Eliminar carrera
     *
     * Elimina la carrera. Requiere rol admin.
     */
    public function destroy(Carrera $carrera): JsonResponse
    {
        $carrera->delete();

        return response()->json(['message' => 'Carrera eliminada correctamente.']);
    }
}
