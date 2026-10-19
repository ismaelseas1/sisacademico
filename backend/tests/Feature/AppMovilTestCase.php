<?php

namespace Tests\Feature;

use App\Models\Carrera;
use App\Models\Docente;
use App\Models\EstadoProyecto;
use App\Models\Estudiante;
use App\Models\Facultad;
use App\Models\Materia;
use App\Models\Rol;
use App\Models\Usuario;
use App\Services\ProyectoService;
use Database\Seeders\EstadoProyectoSeeder;
use Database\Seeders\RolSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** Datos minimos compartidos por las pruebas de la API que consume la app movil. */
abstract class AppMovilTestCase extends TestCase
{
    use RefreshDatabase;

    protected Carrera $carrera;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RolSeeder::class, EstadoProyectoSeeder::class]);

        $facultad = Facultad::create(['nombre' => 'Facultad de Ciencias de la Computacion']);
        $this->carrera = Carrera::create([
            'codigo' => 'SIS',
            'nombre' => 'Ingenieria de Sistemas',
            'facultad_id' => $facultad->id,
            'institucion' => 'Universidad Nacional del Oriente',
        ]);
    }

    protected function usuario(string $rol, string $username): Usuario
    {
        return Usuario::create([
            'username' => $username,
            'email' => "{$username}@uno.edu.bo",
            'password' => 'secreto123',
            'rol_id' => Rol::where('nombre', $rol)->value('id'),
            'activo' => true,
        ]);
    }

    protected function estudiante(string $username): Estudiante
    {
        static $registro = 100;

        return Estudiante::create([
            'usuario_id' => $this->usuario('estudiante', $username)->id,
            'nombre' => ucfirst($username),
            'registro' => '2021-0'.$registro++,
            'carrera_id' => $this->carrera->id,
            'semestre' => 5,
            'ppa' => 7.5,
        ]);
    }

    protected function docente(string $username): Docente
    {
        return Docente::create([
            'usuario_id' => $this->usuario('docente', $username)->id,
            'nombre' => ucfirst($username),
            'especialidad' => 'Ingenieria de Software',
            'facultad' => 'Facultad de Ciencias de la Computacion',
        ]);
    }

    protected function materia(string $codigo = 'SIS-301'): Materia
    {
        return Materia::create([
            'carrera_id' => $this->carrera->id,
            'codigo' => $codigo,
            'nombre' => "Materia {$codigo}",
            'creditos' => 4,
            'semestre_materia' => 5,
        ]);
    }

    protected function estado(string $nombre): int
    {
        return EstadoProyecto::where('nombre', $nombre)->value('id');
    }

    /** Crea un proyecto por el servicio, como lo haria la API (autor = lider). */
    protected function proyecto(Estudiante $autor, ?Docente $tutor = null, string $estado = 'pendiente')
    {
        return app(ProyectoService::class)->crear([
            'estudiante_id' => $autor->id,
            'tutor_id' => $tutor?->id,
            'titulo' => 'Sistema de reservas de laboratorios',
            'estado_id' => $this->estado($estado),
        ]);
    }

    /** Peticiones autenticadas como el usuario indicado (se puede alternar en una misma prueba). */
    protected function como(Usuario $usuario): static
    {
        Sanctum::actingAs($usuario);

        return $this;
    }
}
