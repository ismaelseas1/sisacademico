<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UsuarioRequest;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use App\Services\AuditoriaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UsuarioController extends Controller
{
    public function __construct(private AuditoriaService $auditoria)
    {
    }

    /**
     * Listar usuarios
     *
     * Devuelve los usuarios paginados. Permite buscar por nombre de usuario o
     * correo y filtrar por rol y estado. Requiere rol admin.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $buscar = $request->query('buscar', '');

        $usuarios = Usuario::with('rol')
            ->when($buscar !== '', function ($q) use ($buscar) {
                $q->where(fn ($sub) => $sub->where('username', 'like', "%{$buscar}%")
                    ->orWhere('email', 'like', "%{$buscar}%"));
            })
            ->when($request->filled('rol_id'), fn ($q) => $q->where('rol_id', $request->integer('rol_id')))
            ->when($request->filled('activo'), fn ($q) => $q->where('activo', $request->boolean('activo')))
            ->orderBy('username')
            ->paginate($request->integer('por_pagina', 15));

        return UsuarioResource::collection($usuarios);
    }

    /**
     * Registrar usuario
     *
     * Crea una cuenta de acceso. La contrasena se almacena hasheada. Requiere rol admin.
     */
    public function store(UsuarioRequest $request): JsonResponse
    {
        $usuario = Usuario::create($request->validated());

        $this->auditoria->registrar('crear', 'usuarios', $usuario->id, $request->safe()->except('password'));

        return (new UsuarioResource($usuario->load('rol')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Ver usuario
     *
     * Devuelve un usuario con su rol y su ficha de estudiante o docente.
     */
    public function show(Usuario $usuario): UsuarioResource
    {
        return new UsuarioResource($usuario->load('rol'));
    }

    /**
     * Actualizar usuario
     *
     * Modifica los datos de la cuenta. Requiere rol admin.
     */
    public function update(UsuarioRequest $request, Usuario $usuario): UsuarioResource
    {
        $usuario->update($request->validated());

        $this->auditoria->registrar('actualizar', 'usuarios', $usuario->id, $request->safe()->except('password'));

        return new UsuarioResource($usuario->load('rol'));
    }

    /**
     * Eliminar usuario
     *
     * Realiza un borrado logico (soft delete): el registro conserva su historial
     * y queda marcado con deleted_at. Requiere rol admin.
     */
    public function destroy(Usuario $usuario): JsonResponse
    {
        $usuario->delete();

        $this->auditoria->registrar('eliminar', 'usuarios', $usuario->id);

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }
}
