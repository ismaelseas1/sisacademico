<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    /**
     * Roles definidos en el PDF: "Roles: define permisos
     * (admin, docente, estudiante)".
     */
    public function run(): void
    {
        $roles = [
            ['nombre' => 'admin', 'descripcion' => 'Administra usuarios, catalogos y toda la informacion academica.'],
            ['nombre' => 'docente', 'descripcion' => 'Consulta materias y tutorea proyectos academicos.'],
            ['nombre' => 'estudiante', 'descripcion' => 'Gestiona sus inscripciones y sus proyectos.'],
        ];

        foreach ($roles as $rol) {
            Rol::updateOrCreate(['nombre' => $rol['nombre']], $rol);
        }
    }
}
