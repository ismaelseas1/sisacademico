<?php

namespace Database\Seeders;

use App\Models\Carrera;
use App\Models\Facultad;
use Illuminate\Database\Seeder;

class CarreraSeeder extends Seeder
{
    /**
     * Catalogo de facultades y carreras de la institucion.
     *
     * Es el catalogo que consume el formulario de estudiantes para elegir
     * la carrera (`carrera_id`), via GET /api/v1/carreras.
     *
     * Se puede volver a ejecutar sin duplicar: la facultad se busca por
     * nombre y la carrera por su codigo.
     */
    public function run(): void
    {
        $institucion = 'Universidad Nacional del Oriente';

        $estructura = [
            'Facultad de Ciencias de la Computacion' => [
                ['codigo' => 'SIS', 'nombre' => 'Ingenieria de Sistemas'],
                ['codigo' => 'INF', 'nombre' => 'Ingenieria Informatica'],
                ['codigo' => 'RED', 'nombre' => 'Ingenieria en Redes y Telecomunicaciones'],
            ],
            'Facultad de Ciencias Economicas y Empresariales' => [
                ['codigo' => 'ADM', 'nombre' => 'Administracion de Empresas'],
                ['codigo' => 'CON', 'nombre' => 'Contaduria Publica'],
                ['codigo' => 'COM', 'nombre' => 'Ingenieria Comercial'],
            ],
            'Facultad de Ciencias Juridicas y Sociales' => [
                ['codigo' => 'DER', 'nombre' => 'Derecho'],
                ['codigo' => 'PSI', 'nombre' => 'Psicologia'],
            ],
            'Facultad de Ciencias de la Salud' => [
                ['codigo' => 'ENF', 'nombre' => 'Enfermeria'],
                ['codigo' => 'BIO', 'nombre' => 'Bioquimica y Farmacia'],
            ],
        ];

        foreach ($estructura as $nombreFacultad => $carreras) {
            $facultad = Facultad::firstOrCreate(['nombre' => $nombreFacultad]);

            foreach ($carreras as $carrera) {
                Carrera::updateOrCreate(
                    ['codigo' => $carrera['codigo']],
                    $carrera + [
                        'facultad_id' => $facultad->id,
                        'institucion' => $institucion,
                    ]
                );
            }
        }
    }
}
