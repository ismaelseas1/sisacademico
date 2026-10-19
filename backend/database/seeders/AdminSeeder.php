<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /** Crea el usuario administrador inicial del sistema. */
    public function run(): void
    {
        $rol = Rol::where('nombre', 'admin')->firstOrFail();

        Usuario::updateOrCreate(
            ['username' => 'admin'],
            [
                'email' => 'admin@uno.edu.bo',
                'password' => 'admin12345',
                'rol_id' => $rol->id,
                'activo' => true,
            ]
        );
    }
}
