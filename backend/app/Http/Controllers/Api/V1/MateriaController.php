<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\MateriaRequest;
use App\Http\Resources\MateriaResource;
use App\Models\Materia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MateriaController extends Controller
{
    /**
     * Listar materias
     *
     * Devuelve las materias paginadas con su carrera. Permite buscar por nombre o
     * codigo y filtrar por carrera y semestre.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $materias = Materia::with('carrera')
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where(fn ($sub) => $sub->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('codigo', 'like', "%{$buscar}%"));
            })
            ->when($request->filled('carrera_id'), fn ($q) => $q->where('carrera_id', $request->integer('carrera_id')))
            ->when($request->filled('semestre_materia'), fn ($q) => $q->where('semestre_materia', $request->integer('semestre_materia')))
            ->orderBy('nombre')
            ->paginate($request->integer('por_pagina', 15));

        return MateriaResource::collection($materias);
    }

    /**
     * Registrar materia
     *
     * Crea una materia dentro de una carrera. El codigo es unico. Requiere rol admin.
     */
    public function store(MateriaRequest $request): JsonResponse
    {
        $materia = Materia::create($request->validated());

        return (new MateriaResource($materia->load('carrera')))->response()->setStatusCode(201);
    }

    /**
     * Ver materia
     *
     * Devuelve la materia con su carrera y facultad.
     */
    public function show(Materia $materia): MateriaResource
    {
        return new MateriaResource($materia->load('carrera.facultad'));
    }

    /**
     * Actualizar materia
     *
     * Modifica los datos de la materia. Requiere rol admin.
     */
    public function update(MateriaRequest $request, Materia $materia): MateriaResource
    {
        $materia->update($request->validated());

        return new MateriaResource($materia->load('carrera'));
    }

    /**
     * Eliminar materia
     *
     * Elimina la materia. Requiere rol admin.
     */
    public function destroy(Materia $materia): JsonResponse
    {
        $materia->delete();

        return response()->json(['message' => 'Materia eliminada correctamente.']);
    }
}
