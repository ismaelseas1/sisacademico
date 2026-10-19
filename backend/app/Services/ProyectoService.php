<?php

namespace App\Services;

use App\Models\Proyecto;
use App\Models\ProyectoMiembro;
use Illuminate\Support\Facades\DB;

class ProyectoService
{
    public function __construct(
        private AuditoriaService $auditoria,
        private NotificacionService $notificaciones,
    ) {
    }

    /**
     * Crea el proyecto y registra automaticamente a su autor como
     * miembro lider del equipo.
     */
    public function crear(array $datos): Proyecto
    {
        $proyecto = DB::transaction(function () use ($datos) {
            $proyecto = Proyecto::create($datos);

            ProyectoMiembro::create([
                'proyecto_id' => $proyecto->id,
                'estudiante_id' => $proyecto->estudiante_id,
                'rol' => 'Autor',
                'es_lider' => true,
            ]);

            $this->auditoria->registrar('crear', 'proyectos', $proyecto->id, $datos);

            return $proyecto;
        });

        $this->notificaciones->proyectoAsignadoATutor($proyecto);

        return $proyecto;
    }

    public function actualizar(Proyecto $proyecto, array $datos): Proyecto
    {
        $proyecto->update($datos);

        $this->auditoria->registrar('actualizar', 'proyectos', $proyecto->id, $datos);

        if ($proyecto->wasChanged('estado_id')) {
            $this->notificaciones->estadoProyectoCambiado($proyecto);
        }

        if ($proyecto->wasChanged('tutor_id')) {
            $this->notificaciones->proyectoAsignadoATutor($proyecto);
        }

        return $proyecto;
    }

    public function eliminar(Proyecto $proyecto): void
    {
        $id = $proyecto->id;
        $proyecto->delete();

        $this->auditoria->registrar('eliminar', 'proyectos', $id);
    }

    /**
     * Agrega un miembro al equipo. Si se marca como lider, se retira
     * la condicion de lider al que la tuviera, porque el equipo solo
     * puede tener uno.
     */
    public function agregarMiembro(Proyecto $proyecto, array $datos): ProyectoMiembro
    {
        $miembro = DB::transaction(function () use ($proyecto, $datos) {
            if ($datos['es_lider'] ?? false) {
                $proyecto->miembros()->update(['es_lider' => false]);
            }

            $miembro = $proyecto->miembros()->create([
                'estudiante_id' => $datos['estudiante_id'],
                'rol' => $datos['rol'],
                'es_lider' => $datos['es_lider'] ?? false,
            ]);

            $this->auditoria->registrar('agregar_miembro', 'proyectos_miembros', $miembro->id, $datos);

            return $miembro;
        });

        $this->notificaciones->miembroAgregado($proyecto, $miembro->estudiante_id);

        return $miembro;
    }

    public function quitarMiembro(Proyecto $proyecto, ProyectoMiembro $miembro): void
    {
        $id = $miembro->id;
        $miembro->delete();

        $this->auditoria->registrar('quitar_miembro', 'proyectos_miembros', $id, [
            'proyecto_id' => $proyecto->id,
        ]);

        $this->notificaciones->miembroRetirado($proyecto, $miembro->estudiante_id);
    }
}
