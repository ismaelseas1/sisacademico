<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;

/** Docentes y estudiantes se crean con su cuenta y su rol en un solo paso, desde la web. */
class CuentaConFichaTest extends AppMovilTestCase
{
    private ?Usuario $admin = null;

    private function admin(): Usuario
    {
        return $this->admin ??= $this->usuario('admin', 'admin');
    }

    public function test_crear_docente_crea_su_cuenta_con_rol_docente(): void
    {
        $this->como($this->admin())
            ->postJson('/api/v1/docentes', [
                'username' => 'rflores',
                'email' => 'rflores@uno.edu.bo',
                'password' => 'docente123',
                'nombre' => 'Rosa Flores',
                'especialidad' => 'Redes',
            ])
            ->assertCreated()
            ->assertJsonPath('data.usuario.username', 'rflores')
            ->assertJsonPath('data.usuario.rol.nombre', 'docente');

        // La cuenta nueva ya puede entrar a la app como docente.
        $this->postJson('/api/v1/login', ['identificador' => 'rflores', 'password' => 'docente123'])
            ->assertOk()
            ->assertJsonPath('usuario.rol.nombre', 'docente');
    }

    public function test_crear_estudiante_crea_su_cuenta_con_rol_estudiante(): void
    {
        $this->como($this->admin())
            ->postJson('/api/v1/estudiantes', [
                'username' => 'avaca',
                'email' => 'avaca@uno.edu.bo',
                'password' => 'estudiante123',
                'nombre' => 'Ana Vaca',
                'registro' => '2024-0001',
                'carrera_id' => $this->carrera->id,
                'semestre' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.usuario.rol.nombre', 'estudiante');
    }

    public function test_si_la_ficha_es_invalida_no_queda_una_cuenta_suelta(): void
    {
        $this->como($this->admin())
            ->postJson('/api/v1/estudiantes', [
                'username' => 'avaca',
                'email' => 'avaca@uno.edu.bo',
                'password' => 'estudiante123',
                'nombre' => 'Ana Vaca',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['registro', 'carrera_id', 'semestre']);

        $this->assertDatabaseMissing('usuarios', ['username' => 'avaca']);
    }

    public function test_usuario_o_correo_repetido_se_rechaza(): void
    {
        $this->docente('mlopez');

        $this->como($this->admin())
            ->postJson('/api/v1/docentes', [
                'username' => 'mlopez',
                'email' => 'mlopez@uno.edu.bo',
                'password' => 'docente123',
                'nombre' => 'Otra Persona',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username', 'email']);
    }

    public function test_editar_docente_sin_contrasena_conserva_la_anterior(): void
    {
        $docente = $this->docente('mlopez');

        $this->como($this->admin())
            ->putJson("/api/v1/docentes/{$docente->id}", [
                'nombre' => 'Maria Lopez Vargas',
                'email' => 'maria.lopez@uno.edu.bo',
                'password' => '',
            ])
            ->assertOk()
            ->assertJsonPath('data.usuario.email', 'maria.lopez@uno.edu.bo');

        $this->postJson('/api/v1/login', ['identificador' => 'mlopez', 'password' => 'secreto123'])->assertOk();
    }

    public function test_eliminar_docente_desactiva_su_cuenta(): void
    {
        $docente = $this->docente('mlopez');

        $this->como($this->admin())->deleteJson("/api/v1/docentes/{$docente->id}")->assertOk();

        $this->assertSoftDeleted('usuarios', ['id' => $docente->usuario_id]);
    }

    public function test_desde_usuarios_solo_se_crean_administradores(): void
    {
        $rol = fn (string $nombre) => Rol::where('nombre', $nombre)->value('id');
        $datos = ['username' => 'nuevo', 'email' => 'nuevo@uno.edu.bo', 'password' => 'secreto123'];

        $this->como($this->admin())
            ->postJson('/api/v1/usuarios', $datos + ['rol_id' => $rol('docente')])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rol_id');

        $this->como($this->admin())
            ->postJson('/api/v1/usuarios', $datos + ['rol_id' => $rol('admin')])
            ->assertCreated();
    }

    public function test_a_una_cuenta_de_docente_no_se_le_cambia_el_rol(): void
    {
        $docente = $this->docente('mlopez');

        $this->como($this->admin())
            ->putJson("/api/v1/usuarios/{$docente->usuario_id}", ['rol_id' => Rol::where('nombre', 'estudiante')->value('id')])
            ->assertUnprocessable();

        // Reenviar el mismo rol al editar otros datos si se permite.
        $this->como($this->admin())
            ->putJson("/api/v1/usuarios/{$docente->usuario_id}", ['rol_id' => $docente->usuario->rol_id, 'activo' => true])
            ->assertOk();
    }

    public function test_cuenta_antigua_con_ficha_de_docente_se_corrige_a_docente(): void
    {
        // Como quedaron los docentes creados antes: ficha de docente sobre una cuenta admin.
        $docente = $this->docente('rflores');
        $docente->usuario->update(['rol_id' => Rol::where('nombre', 'admin')->value('id')]);
        $rol = fn (string $nombre) => Rol::where('nombre', $nombre)->value('id');

        $this->como($this->admin())
            ->putJson("/api/v1/usuarios/{$docente->usuario_id}", ['rol_id' => $rol('estudiante')])
            ->assertUnprocessable();

        $this->como($this->admin())
            ->putJson("/api/v1/usuarios/{$docente->usuario_id}", ['rol_id' => $rol('docente')])
            ->assertOk()
            ->assertJsonPath('data.rol.nombre', 'docente');
    }

    public function test_cuenta_sin_ficha_no_pasa_a_docente(): void
    {
        $suelta = $this->usuario('admin', 'suelta');

        $this->como($this->admin())
            ->putJson("/api/v1/usuarios/{$suelta->id}", ['rol_id' => Rol::where('nombre', 'docente')->value('id')])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('rol_id');
    }
}
