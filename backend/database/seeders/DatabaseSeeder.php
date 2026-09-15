<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Carga los datos minimos que el sistema necesita para operar.
     */
    public function run(): void
    {
        $this->call([
            RolSeeder::class,
            AdminSeeder::class,
        ]);
    }
}
