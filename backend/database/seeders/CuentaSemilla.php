<?php

namespace Database\Seeders;

use App\Models\Usuario;

/**
 * Cuentas de los seeders. El contenedor ejecuta los seeders en cada arranque, asi
 * que deben respetar lo que el admin hizo desde el panel: no se cambian
 * contrasenas ni roles de cuentas existentes y no se reviven cuentas eliminadas.
 */
trait CuentaSemilla
{
    /**
     * Devuelve la cuenta si ya existe (sin modificarla), la crea si no existe, o
     * null si fue eliminada (borrado logico): en ese caso no se vuelve a sembrar.
     */
    protected function cuentaSemilla(string $username, string $email, string $password, int $rolId): ?Usuario
    {
        $existente = Usuario::withTrashed()
            ->where('username', $username)
            ->orWhere('email', $email)
            ->first();

        if ($existente !== null) {
            return $existente->trashed() ? null : $existente;
        }

        return Usuario::create([
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'rol_id' => $rolId,
            'activo' => true,
        ]);
    }
}
