<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DocenteRequest;
use App\Http\Resources\DocenteResource;
use App\Models\Docente;
use App\Services\AuditoriaService;
use App\Services\CuentaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class DocenteController extends Controller
{
    public function __construct(private AuditoriaService $auditoria, private CuentaService $cuentas)
    {
    }

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
     * Crea la ficha del docente junto con su cuenta de acceso (username, email,
     * password), que recibe automaticamente el rol docente. Requiere rol admin.
     */
    public function store(DocenteRequest $request): JsonResponse
    {
        $docente = DB::transaction(function () use ($request) {
            $usuario = $this->cuentas->crear('docente', $request->validated());

            return $usuario->docente()->create($request->safe()->except(CuentaService::CAMPOS));
        });

        $this->auditoria->registrar('crear', 'docentes', $docente->id, $request->safe()->except('password'));

        return (new DocenteResource($docente->load('usuario.rol')))->response()->setStatusCode(201);
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
     * Modifica la ficha del docente y, si se envian, los datos de su cuenta
     * (la contrasena vacia no se cambia). Requiere rol admin.
     */
    public function update(DocenteRequest $request, Docente $docente): DocenteResource
    {
        DB::transaction(function () use ($request, $docente) {
            $docente->update($request->safe()->except(CuentaService::CAMPOS));
            $this->cuentas->actualizar($docente->usuario, $request->validated());
        });

        $this->auditoria->registrar('actualizar', 'docentes', $docente->id, $request->safe()->except('password'));

        return new DocenteResource($docente->load('usuario.rol'));
    }

    /**
     * Eliminar docente
     *
     * Elimina la ficha del docente y desactiva su cuenta (borrado logico), para
     * que no quede un usuario docente sin ficha. Requiere rol admin.
     */
    public function destroy(Docente $docente): JsonResponse
    {
        DB::transaction(function () use ($docente) {
            $usuario = $docente->usuario;
            $docente->delete();
            $this->cuentas->eliminar($usuario);
        });

        $this->auditoria->registrar('eliminar', 'docentes', $docente->id);

        return response()->json(['message' => 'Docente eliminado correctamente.']);
    }
}
