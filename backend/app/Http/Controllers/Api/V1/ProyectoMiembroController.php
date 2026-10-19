<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProyectoMiembroRequest;
use App\Http\Resources\ProyectoMiembroResource;
use App\Models\Proyecto;
use App\Models\ProyectoMiembro;
use App\Services\ProyectoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ProyectoMiembroController extends Controller
{
    public function __construct(private ProyectoService $proyectos)
    {
    }

    /**
     * Listar miembros del proyecto
     *
     * Devuelve el equipo del proyecto con el rol de cada integrante.
     */
    public function index(Proyecto $proyecto): AnonymousResourceCollection
    {
        return ProyectoMiembroResource::collection(
            $proyecto->miembros()->with('estudiante')->get()
        );
    }

    /**
     * Agregar miembro al proyecto
     *
     * Incorpora un estudiante al equipo. Si se lo marca como lider, se retira esa
     * condicion al lider anterior: el equipo solo puede tener uno.
     */
    public function store(ProyectoMiembroRequest $request, Proyecto $proyecto): JsonResponse
    {
        Gate::authorize('gestionarMiembros', $proyecto);

        $miembro = $this->proyectos->agregarMiembro($proyecto, $request->validated());

        return (new ProyectoMiembroResource($miembro->load('estudiante')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Retirar miembro del proyecto
     *
     * Quita al estudiante del equipo. Responde 404 si el miembro no pertenece al proyecto.
     */
    public function destroy(Proyecto $proyecto, ProyectoMiembro $miembro): JsonResponse
    {
        abort_if($miembro->proyecto_id !== $proyecto->id, 404, 'El miembro no pertenece a este proyecto.');
        Gate::authorize('gestionarMiembros', $proyecto);

        $this->proyectos->quitarMiembro($proyecto, $miembro);

        return response()->json(['message' => 'Miembro retirado del proyecto.']);
    }
}
