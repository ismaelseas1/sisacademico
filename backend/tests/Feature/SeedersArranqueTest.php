<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * El contenedor de Render ejecuta los seeders en cada arranque: deben poder
 * repetirse sin fallar y sin deshacer lo que el admin cambio desde el panel.
 */
class SeedersArranqueTest extends TestCase
{
    use RefreshDatabase;

    private function arrancar(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DemoSeeder::class);
    }

    public function test_se_pueden_repetir_sin_errores(): void
    {
        $this->arrancar();
        $this->arrancar();

        $this->assertSame(1, Usuario::where('username', 'admin')->count());
        $this->assertDatabaseHas('docentes', ['nombre' => 'Maria Lopez Vargas']);
    }

    public function test_no_restablecen_contrasenas_cambiadas(): void
    {
        $this->arrancar();
        Usuario::where('username', 'admin')->first()->update(['password' => 'nueva-segura-1']);
        Usuario::where('username', 'mlopez')->first()->update(['password' => 'otra-clave-2']);

        $this->arrancar();

        $this->assertTrue(Hash::check('nueva-segura-1', Usuario::where('username', 'admin')->value('password')));
        $this->assertTrue(Hash::check('otra-clave-2', Usuario::where('username', 'mlopez')->value('password')));
    }

    public function test_admin_eliminado_con_otro_admin_activo_no_rompe_el_arranque(): void
    {
        // Lo que paso en Render: la cuenta "admin" se elimino (borrado logico).
        $this->arrancar();
        Usuario::create([
            'username' => 'directora', 'email' => 'directora@uno.edu.bo', 'password' => 'secreto123',
            'rol_id' => Rol::where('nombre', 'admin')->value('id'), 'activo' => true,
        ]);
        Usuario::where('username', 'admin')->first()->delete();

        $this->arrancar();

        $this->assertSoftDeleted('usuarios', ['username' => 'admin']);
    }

    public function test_sin_ningun_admin_activo_se_restaura_el_inicial(): void
    {
        $this->arrancar();
        Usuario::where('username', 'admin')->first()->delete();

        $this->arrancar();

        $this->assertNotSoftDeleted('usuarios', ['username' => 'admin']);
        $this->postJson('/api/v1/login', ['identificador' => 'admin', 'password' => 'admin12345'])->assertOk();
    }

    public function test_cuenta_demo_eliminada_no_vuelve(): void
    {
        $this->arrancar();
        Usuario::where('username', 'rmamani')->first()->delete();

        $this->arrancar();

        $this->assertSoftDeleted('usuarios', ['username' => 'rmamani']);
    }
}
