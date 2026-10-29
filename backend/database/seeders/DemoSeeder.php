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
use Illuminate\Database\Seeder;

/**
 * Datos de demostracion para desarrollar y presentar el sistema.
 *
 * Se ejecuta aparte de DatabaseSeeder:
 *   php artisan db:seed --class=DemoSeeder
 *
 * Las cuentas demo solo se crean si no existen (ver CuentaSemilla): no se
 * restablecen contrasenas y las personas eliminadas desde el panel no vuelven.
 */
class DemoSeeder extends Seeder
{
    use CuentaSemilla;

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
        $uDocente = $this->cuentaSemilla('mlopez', 'mlopez@uno.edu.bo', 'docente123', $rolDocente->id);

        $docente = $uDocente === null ? null : Docente::firstOrCreate(
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

        $estudiantes = collect($datosEstudiantes)->mapWithKeys(function ($d) use ($rolEstudiante, $carrera) {
            $usuario = $this->cuentaSemilla($d['username'], $d['username'].'@uno.edu.bo', 'estudiante123', $rolEstudiante->id);

            if ($usuario === null || Estudiante::where('registro', $d['registro'])->where('usuario_id', '!=', $usuario->id)->exists()) {
                return [];
            }

            return [$d['username'] => Estudiante::firstOrCreate(
                ['usuario_id' => $usuario->id],
                [
                    'nombre' => $d['nombre'],
                    'registro' => $d['registro'],
                    'carrera_id' => $carrera->id,
                    'semestre' => $d['semestre'],
                    'fecha_nacimiento' => $d['nacimiento'],
                    'ppa' => $d['ppa'],
                ]
            )];
        });

        // --- Inscripciones ---
        foreach ($estudiantes as $estudiante) {
            foreach ($materias->take(2) as $materia) {
                Inscripcion::firstOrCreate(
                    ['estudiante_id' => $estudiante->id, 'materia_id' => $materia->id],
                    ['fecha_inscripcion' => now()->subDays(random_int(5, 40))]
                );
            }
        }

        // --- Proyecto con equipo (solo si siguen el autor, la companera y el tutor) ---
        if (! isset($estudiantes['jperez'], $estudiantes['lgutierrez']) || $docente === null) {
            return;
        }

        $enProgreso = EstadoProyecto::where('nombre', 'en progreso')->firstOrFail();

        $proyecto = Proyecto::firstOrCreate(
            ['titulo' => 'Sistema academico integrador'],
            [
                'estudiante_id' => $estudiantes['jperez']->id,
                'tutor_id' => $docente->id,
                'descripcion' => 'API REST en Laravel consumida por una SPA en Angular, sobre el modelo de datos compartido entre los grupos.',
                'estado_id' => $enProgreso->id,
                'fecha_inicio' => now()->startOfMonth()->toDateString(),
            ]
        );

        $equipo = [
            [$estudiantes['jperez'], 'Backend', true],
            [$estudiantes['lgutierrez'], 'Frontend', false],
        ];

        foreach ($equipo as [$estudiante, $rol, $lider]) {
            ProyectoMiembro::firstOrCreate(
                ['proyecto_id' => $proyecto->id, 'estudiante_id' => $estudiante->id],
                ['rol' => $rol, 'es_lider' => $lider]
            );
        }
    }
}
