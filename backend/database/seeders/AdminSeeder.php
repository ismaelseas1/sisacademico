<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Garantiza que exista al menos un administrador activo.
     *
     * Si ya hay uno, no se toca nada (ni su contrasena). Solo si no queda ningun
     * admin activo se crea la cuenta inicial, o se restaura si fue eliminada,
     * con la contrasena por defecto para no dejar el sistema sin acceso.
     */
    public function run(): void
    {
        $rol = Rol::where('nombre', 'admin')->firstOrFail();

        if (Usuario::where('rol_id', $rol->id)->where('activo', true)->exists()) {
            return;
        }

        $admin = Usuario::withTrashed()
            ->where('username', 'admin')
            ->orWhere('email', 'admin@uno.edu.bo')
            ->first() ?? new Usuario(['username' => 'admin', 'email' => 'admin@uno.edu.bo']);

        $admin->fill(['password' => 'admin12345', 'rol_id' => $rol->id, 'activo' => true]);
        $admin->deleted_at = null;
        $admin->save();

        $this->command?->warn("Sin administradores activos: se habilito la cuenta '{$admin->username}' con la contrasena inicial. Cambiela.");
    }
}
