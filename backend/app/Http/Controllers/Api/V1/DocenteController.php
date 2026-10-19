<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DocenteRequest;
use App\Http\Resources\DocenteResource;
use App\Models\Docente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DocenteController extends Controller
{
    /**
     * Listar docentes
     *
     * Devuelve los docentes paginados con su cuenta. Permite buscar por nombre o especialidad.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $docentes = Docente::with('usuario.rol')
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where(fn ($sub) => $sub->where('nombre', 'like', "%{$buscar}%")
                    ->orWhere('especialidad', 'like', "%{$buscar}%"));
            })
            ->when($request->filled('facultad'), fn ($q) => $q->where('facultad', $request->string('facultad')->toString()))
            ->orderBy('nombre')
            ->paginate($request->integer('por_pagina', 15));

        return DocenteResource::collection($docentes);
    }

    /**
     * Registrar docente
     *
     * Crea la ficha del docente y la vincula a una cuenta de usuario. Requiere rol admin.
     */
    public function store(DocenteRequest $request): JsonResponse
    {
        $docente = Docente::create($request->validated());

        return (new DocenteResource($docente->load('usuario')))->response()->setStatusCode(201);
    }

    /**
     * Ver docente
     *
     * Devuelve el docente con su cuenta y su rol.
     */
    public function show(Docente $docente): DocenteResource
    {
        return new DocenteResource($docente->load('usuario.rol'));
    }

    /**
     * Actualizar docente
     *
     * Modifica la ficha del docente. Requiere rol admin.
     */
    public function update(DocenteRequest $request, Docente $docente): DocenteResource
    {
        $docente->update($request->validated());

        return new DocenteResource($docente->load('usuario'));
    }

    /**
     * Eliminar docente
     *
     * Elimina la ficha del docente. Requiere rol admin.
     */
    public function destroy(Docente $docente): JsonResponse
    {
        $docente->delete();

        return response()->json(['message' => 'Docente eliminado correctamente.']);
    }
}
