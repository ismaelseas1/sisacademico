<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Carga los catalogos base del modelo academico.
     * Los datos de demostracion viven en DemoSeeder para no
     * contaminar la base compartida con los otros grupos.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            CarreraSeeder::class,
            EstadoProyectoSeeder::class,
            AdminSeeder::class,
        ]);
    }
}
