<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\FacultadRequest;
use App\Http\Resources\FacultadResource;
use App\Models\Facultad;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FacultadController extends Controller
{
    /**
     * Listar facultades
     *
     * Devuelve las facultades paginadas, con busqueda por nombre.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $facultades = Facultad::query()
            ->when($buscar !== '', fn ($q) => $q->where('nombre', 'like', "%{$buscar}%"))
            ->orderBy('nombre')
            ->paginate($request->integer('por_pagina', 15));

        return FacultadResource::collection($facultades);
    }

    /**
     * Registrar facultad
     *
     * Crea una facultad. Requiere rol admin.
     */
    public function store(FacultadRequest $request): JsonResponse
    {
        $facultad = Facultad::create($request->validated());

        return (new FacultadResource($facultad))->response()->setStatusCode(201);
    }

    /**
     * Ver facultad
     *
     * Devuelve la facultad con las carreras que agrupa.
     */
    public function show(Facultad $facultad): FacultadResource
    {
        return new FacultadResource($facultad->load('carreras'));
    }

    /**
     * Actualizar facultad
     *
     * Modifica el nombre de la facultad. Requiere rol admin.
     */
    public function update(FacultadRequest $request, Facultad $facultad): FacultadResource
    {
        $facultad->update($request->validated());

        return new FacultadResource($facultad);
    }

    /**
     * Eliminar facultad
     *
     * Elimina la facultad. Requiere rol admin.
     */
    public function destroy(Facultad $facultad): JsonResponse
    {
        $facultad->delete();

        return response()->json(['message' => 'Facultad eliminada correctamente.']);
    }
}
