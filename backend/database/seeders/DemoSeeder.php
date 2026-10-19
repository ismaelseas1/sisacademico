<?php

namespace Database\Seeders;

use App\Models\Carrera;
use App\Models\Docente;
use App\Models\EstadoProyecto;
use App\Models\Estudiante;
use App\Models\Facultad;
use App\Models\Inscripcion;
use App\Models\Materia;
use App\Models\Proyecto;
use App\Models\ProyectoMiembro;
use App\Models\Rol;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

/**
 * Datos de demostracion para desarrollar y presentar el sistema.
 *
 * Se ejecuta aparte de DatabaseSeeder:
 *   php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $rolDocente = Rol::where('nombre', 'docente')->firstOrFail();
        $rolEstudiante = Rol::where('nombre', 'estudiante')->firstOrFail();

        $facultad = Facultad::updateOrCreate(
            ['nombre' => 'Facultad de Ciencias de la Computacion']
        );

        $carrera = Carrera::updateOrCreate(
            ['codigo' => 'SIS'],
            [
                'nombre' => 'Ingenieria de Sistemas',
                'facultad_id' => $facultad->id,
                'institucion' => 'Universidad Nacional del Oriente',
            ]
        );

        $materias = collect([
            ['codigo' => 'SIS-301', 'nombre' => 'Base de Datos II', 'creditos' => 4, 'semestre_materia' => 5],
            ['codigo' => 'SIS-302', 'nombre' => 'Ingenieria de Software I', 'creditos' => 5, 'semestre_materia' => 5],
            ['codigo' => 'SIS-401', 'nombre' => 'Desarrollo Web Avanzado', 'creditos' => 4, 'semestre_materia' => 7],
        ])->map(fn ($m) => Materia::updateOrCreate(
            ['codigo' => $m['codigo']],
            $m + ['carrera_id' => $carrera->id]
        ));

        // --- Docente tutor ---
        $uDocente = Usuario::updateOrCreate(
            ['username' => 'mlopez'],
            ['email' => 'mlopez@uno.edu.bo', 'password' => 'docente123', 'rol_id' => $rolDocente->id, 'activo' => true]
        );

        $docente = Docente::updateOrCreate(
            ['usuario_id' => $uDocente->id],
            [
                'nombre' => 'Maria Lopez Vargas',
                'especialidad' => 'Ingenieria de Software',
                'facultad' => $facultad->nombre,
            ]
        );

        // --- Estudiantes ---
        $datosEstudiantes = [
            ['username' => 'jperez', 'nombre' => 'Juan Perez Rojas', 'registro' => '2021-0451', 'semestre' => 5, 'ppa' => 7.85, 'nacimiento' => '2002-03-14'],
            ['username' => 'lgutierrez', 'nombre' => 'Lucia Gutierrez Soto', 'registro' => '2021-0478', 'semestre' => 5, 'ppa' => 8.40, 'nacimiento' => '2002-07-22'],
            ['username' => 'rmamani', 'nombre' => 'Ricardo Mamani Choque', 'registro' => '2020-0312', 'semestre' => 7, 'ppa' => 6.95, 'nacimiento' => '2001-11-05'],
        ];

        $estudiantes = collect($datosEstudiantes)->map(function ($d) use ($rolEstudiante, $carrera) {
            $usuario = Usuario::updateOrCreate(
                ['username' => $d['username']],
                [
                    'email' => $d['username'].'@uno.edu.bo',
                    'password' => 'estudiante123',
                    'rol_id' => $rolEstudiante->id,
                    'activo' => true,
                ]
            );

            return Estudiante::updateOrCreate(
                ['usuario_id' => $usuario->id],
                [
                    'nombre' => $d['nombre'],
                    'registro' => $d['registro'],
                    'carrera_id' => $carrera->id,
                    'semestre' => $d['semestre'],
                    'fecha_nacimiento' => $d['nacimiento'],
                    'ppa' => $d['ppa'],
                ]
            );
        });

        // --- Inscripciones ---
        foreach ($estudiantes as $estudiante) {
            foreach ($materias->take(2) as $materia) {
                Inscripcion::updateOrCreate(
                    ['estudiante_id' => $estudiante->id, 'materia_id' => $materia->id],
                    ['fecha_inscripcion' => now()->subDays(random_int(5, 40))]
                );
            }
        }

        // --- Proyecto con equipo ---
        $enProgreso = EstadoProyecto::where('nombre', 'en progreso')->firstOrFail();

        $proyecto = Proyecto::updateOrCreate(
            ['titulo' => 'Sistema academico integrador'],
            [
                'estudiante_id' => $estudiantes[0]->id,
                'tutor_id' => $docente->id,
                'descripcion' => 'API REST en Laravel consumida por una SPA en Angular, sobre el modelo de datos compartido entre los grupos.',
                'estado_id' => $enProgreso->id,
                'fecha_inicio' => now()->startOfMonth()->toDateString(),
            ]
        );

        $equipo = [
            [$estudiantes[0], 'Backend', true],
            [$estudiantes[1], 'Frontend', false],
        ];

        foreach ($equipo as [$estudiante, $rol, $lider]) {
            ProyectoMiembro::updateOrCreate(
                ['proyecto_id' => $proyecto->id, 'estudiante_id' => $estudiante->id],
                ['rol' => $rol, 'es_lider' => $lider]
            );
        }
    }
}
