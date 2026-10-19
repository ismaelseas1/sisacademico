<?php

namespace App\Services;

use App\Models\Dispositivo;
use App\Models\Docente;
use App\Models\Estudiante;
use App\Models\Proyecto;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Avisos push de la app movil ante cambios en los proyectos.
 *
 * Los envios se hacen al terminar la peticion (app()->terminating), asi el
 * usuario recibe su respuesta sin esperar a Firebase, y un fallo de FCM nunca
 * revierte la operacion. No se notifica a quien hizo el cambio.
 */
class NotificacionService
{
    public function __construct(private FirebaseMessaging $fcm)
    {
    }

    public function proyectoAsignadoATutor(Proyecto $proyecto): void
    {
        $this->enviarADocente(
            $proyecto->tutor_id,
            'Nuevo proyecto para tutorar',
            "Te asignaron como tutor de \"{$proyecto->titulo}\".",
            $proyecto,
            'proyecto_asignado',
        );
    }

    public function estadoProyectoCambiado(Proyecto $proyecto): void
    {
        $estado = $proyecto->estado()->value('nombre');

        $this->enviarAEstudiantes(
            $proyecto->miembros()->pluck('estudiante_id')->all(),
            'Tu proyecto cambio de estado',
            "\"{$proyecto->titulo}\" ahora esta: {$estado}.",
            $proyecto,
            'estado_proyecto',
        );
    }

    public function miembroAgregado(Proyecto $proyecto, int $estudianteId): void
    {
        $this->enviarAEstudiantes(
            [$estudianteId],
            'Te agregaron a un proyecto',
            "Ahora formas parte del equipo de \"{$proyecto->titulo}\".",
            $proyecto,
            'miembro_agregado',
        );
    }

    public function miembroRetirado(Proyecto $proyecto, int $estudianteId): void
    {
        $this->enviarAEstudiantes(
            [$estudianteId],
            'Ya no formas parte de un proyecto',
            "Te retiraron del equipo de \"{$proyecto->titulo}\".",
            $proyecto,
            'miembro_retirado',
        );
    }

    private function enviarAEstudiantes(array $estudianteIds, string $titulo, string $cuerpo, Proyecto $proyecto, string $tipo): void
    {
        $usuarioIds = Estudiante::whereIn('id', $estudianteIds)->pluck('usuario_id')->all();

        $this->enviarAUsuarios($usuarioIds, $titulo, $cuerpo, $proyecto, $tipo);
    }

    private function enviarADocente(?int $docenteId, string $titulo, string $cuerpo, Proyecto $proyecto, string $tipo): void
    {
        if ($docenteId === null) {
            return;
        }

        $this->enviarAUsuarios(Docente::whereKey($docenteId)->pluck('usuario_id')->all(), $titulo, $cuerpo, $proyecto, $tipo);
    }

    private function enviarAUsuarios(array $usuarioIds, string $titulo, string $cuerpo, Proyecto $proyecto, string $tipo): void
    {
        $destinatarios = array_values(array_diff($usuarioIds, [auth()->id()]));

        if ($destinatarios === [] || ! $this->fcm->configurado()) {
            return;
        }

        $datos = ['tipo' => $tipo, 'proyecto_id' => (string) $proyecto->id];

        $pendiente = true;

        app()->terminating(function () use (&$pendiente, $destinatarios, $titulo, $cuerpo, $datos) {
            // Los callbacks de terminating persisten en procesos largos (pruebas, colas):
            // cada aviso se envia una sola vez.
            if (! $pendiente) {
                return;
            }
            $pendiente = false;

            try {
                Dispositivo::whereIn('usuario_id', $destinatarios)->each(function (Dispositivo $dispositivo) use ($titulo, $cuerpo, $datos) {
                    if ($this->fcm->enviar($dispositivo->token, $titulo, $cuerpo, $datos) === FirebaseMessaging::TOKEN_INVALIDO) {
                        $dispositivo->delete();
                    }
                });
            } catch (Throwable $e) {
                Log::error('FCM: fallo el envio de notificaciones.', ['error' => $e->getMessage()]);
            }
        });
    }
}
