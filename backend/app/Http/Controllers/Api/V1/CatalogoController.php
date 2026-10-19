<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditoriaResource;
use App\Http\Resources\EstadoProyectoResource;
use App\Http\Resources\RolResource;
use App\Models\Auditoria;
use App\Models\EstadoProyecto;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Catalogos de solo lectura y consulta del historial de auditoria.
 *
 * Roles y estados de proyecto son catalogos fijos definidos en el modelo,
 * por lo que la API solo los expone para consulta.
 */
class CatalogoController extends Controller
{
    /**
     * Listar roles
     *
     * Catalogo de roles del sistema: admin, docente y estudiante.
     */
    public function roles(): AnonymousResourceCollection
    {
        return RolResource::collection(Rol::orderBy('nombre')->get());
    }

    /**
     * Listar estados de proyecto
     *
     * Catalogo de estados: pendiente, en progreso y finalizado.
     */
    public function estadosProyecto(): AnonymousResourceCollection
    {
        return EstadoProyectoResource::collection(EstadoProyecto::orderBy('id')->get());
    }

    /**
     * Consultar auditoria
     *
     * Historial de acciones realizadas sobre el sistema, ordenado de mas reciente
     * a mas antiguo. Permite filtrar por usuario, tabla y accion. Requiere rol admin.
     */
    public function auditoria(Request $request): AnonymousResourceCollection
    {
        $registros = Auditoria::with('usuario')
            ->when($request->filled('usuario_id'), fn ($q) => $q->where('usuario_id', $request->integer('usuario_id')))
            ->when($request->filled('tabla'), fn ($q) => $q->where('tabla', $request->string('tabla')->toString()))
            ->when($request->filled('accion'), fn ($q) => $q->where('accion', $request->string('accion')->toString()))
            ->latest('fecha')
            ->paginate($request->integer('por_pagina', 25));

        return AuditoriaResource::collection($registros);
    }
}
