<?php

namespace App\Services;

use App\Models\Rol;
use App\Models\Usuario;

/**
 * Cuenta de acceso de un docente o estudiante.
 *
 * La cuenta se crea, edita y elimina junto con la ficha (desde el modulo Docentes
 * o Estudiantes), y su rol lo decide la ficha: asi nunca queda un docente con
 * una cuenta de otro rol ni una cuenta de docente sin ficha.
 */
class CuentaService
{
    /** Campos de la cuenta que llegan en el mismo formulario de la ficha. */
    public const CAMPOS = ['username', 'email', 'password', 'activo'];

    public function crear(string $rol, array $datos): Usuario
    {
        return Usuario::create([
            'username' => $datos['username'],
            'email' => $datos['email'],
            'password' => $datos['password'],
            'activo' => $datos['activo'] ?? true,
            'rol_id' => Rol::where('nombre', $rol)->firstOrFail()->id,
        ]);
    }

    /** Actualiza solo lo enviado; la contrasena vacia no se cambia. */
    public function actualizar(?Usuario $usuario, array $datos): void
    {
        if ($usuario === null) {
            return;
        }

        $cambios = array_intersect_key($datos, array_flip(self::CAMPOS));

        if (empty($cambios['password'])) {
            unset($cambios['password']);
        }

        if ($cambios) {
            $usuario->update($cambios);
        }

        // Una cuenta desactivada no debe seguir usando la app con un token anterior.
        if (array_key_exists('activo', $cambios) && ! $cambios['activo']) {
            $usuario->tokens()->delete();
        }
    }

    /** Borrado logico de la cuenta: deja de poder ingresar y conserva su historial. */
    public function eliminar(?Usuario $usuario): void
    {
        if ($usuario === null) {
            return;
        }

        $usuario->tokens()->delete();
        $usuario->delete();
    }
}
