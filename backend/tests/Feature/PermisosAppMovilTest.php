<?php

namespace Tests\Feature;

use App\Models\Inscripcion;

class PermisosAppMovilTest extends AppMovilTestCase
{
    public function test_estudiante_se_inscribe_a_si_mismo_pero_no_a_otro(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $materia = $this->materia();

        $this->como($juan->usuario)
            ->postJson('/api/v1/inscripciones', ['estudiante_id' => $juan->id, 'materia_id' => $materia->id])
            ->assertCreated();

        $this->como($juan->usuario)
            ->postJson('/api/v1/inscripciones', ['estudiante_id' => $lucia->id, 'materia_id' => $materia->id])
            ->assertForbidden()
            ->assertJson(['message' => 'Solo puede gestionar sus propias inscripciones.']);
    }

    public function test_estudiante_no_da_de_baja_la_inscripcion_de_otro(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $ajena = Inscripcion::create(['estudiante_id' => $lucia->id, 'materia_id' => $this->materia()->id, 'fecha_inscripcion' => now()]);

        $this->como($juan->usuario)->deleteJson("/api/v1/inscripciones/{$ajena->id}")->assertForbidden();
        $this->como($lucia->usuario)->deleteJson("/api/v1/inscripciones/{$ajena->id}")->assertOk();
    }

    public function test_admin_inscribe_a_cualquier_estudiante(): void
    {
        $lucia = $this->estudiante('lgutierrez');

        $this->como($this->usuario('admin', 'admin'))
            ->postJson('/api/v1/inscripciones', ['estudiante_id' => $lucia->id, 'materia_id' => $this->materia()->id])
            ->assertCreated();
    }

    public function test_estudiante_crea_proyecto_propio_solo_en_estado_pendiente(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $datos = ['estudiante_id' => $juan->id, 'titulo' => 'Biblioteca digital', 'estado_id' => $this->estado('pendiente')];

        $this->como($juan->usuario)->postJson('/api/v1/proyectos', $datos)->assertCreated();

        $this->como($juan->usuario)
            ->postJson('/api/v1/proyectos', ['estado_id' => $this->estado('finalizado')] + $datos)
            ->assertForbidden();

        $this->como($juan->usuario)
            ->postJson('/api/v1/proyectos', ['estudiante_id' => $lucia->id] + $datos)
            ->assertForbidden();
    }

    public function test_lider_edita_el_proyecto_pero_no_cambia_su_estado(): void
    {
        $juan = $this->estudiante('jperez');
        $proyecto = $this->proyecto($juan);

        $this->como($juan->usuario)
            ->putJson("/api/v1/proyectos/{$proyecto->id}", ['titulo' => 'Nuevo titulo'])
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Nuevo titulo');

        $this->como($juan->usuario)
            ->putJson("/api/v1/proyectos/{$proyecto->id}", ['estado_id' => $this->estado('finalizado')])
            ->assertForbidden()
            ->assertJson(['message' => 'El estado del proyecto lo cambia el docente tutor.']);
    }

    public function test_miembro_que_no_es_lider_no_edita_ni_agrega_miembros(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $diego = $this->estudiante('danez');
        $proyecto = $this->proyecto($juan);
        $proyecto->miembros()->create(['estudiante_id' => $lucia->id, 'rol' => 'Desarrollo', 'es_lider' => false]);

        $this->como($lucia->usuario)
            ->putJson("/api/v1/proyectos/{$proyecto->id}", ['titulo' => 'Otro'])
            ->assertForbidden();

        $this->como($lucia->usuario)
            ->postJson("/api/v1/proyectos/{$proyecto->id}/miembros", ['estudiante_id' => $diego->id, 'rol' => 'Pruebas'])
            ->assertForbidden();

        $this->como($juan->usuario)
            ->postJson("/api/v1/proyectos/{$proyecto->id}/miembros", ['estudiante_id' => $diego->id, 'rol' => 'Pruebas'])
            ->assertCreated();
    }

    public function test_solo_el_autor_elimina_el_proyecto(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $proyecto = $this->proyecto($juan);

        $this->como($lucia->usuario)->deleteJson("/api/v1/proyectos/{$proyecto->id}")->assertForbidden();
        $this->como($juan->usuario)->deleteJson("/api/v1/proyectos/{$proyecto->id}")->assertOk();
    }

    public function test_docente_tutor_cambia_el_estado_y_otro_docente_no(): void
    {
        $juan = $this->estudiante('jperez');
        $tutora = $this->docente('mlopez');
        $otro = $this->docente('jsuarez');
        $proyecto = $this->proyecto($juan, $tutora);
        $enProgreso = ['estado_id' => $this->estado('en progreso')];

        $this->como($otro->usuario)->putJson("/api/v1/proyectos/{$proyecto->id}", $enProgreso)->assertForbidden();

        $this->como($tutora->usuario)
            ->putJson("/api/v1/proyectos/{$proyecto->id}", $enProgreso)
            ->assertOk()
            ->assertJsonPath('data.estado_id', $this->estado('en progreso'));
    }

    public function test_docente_no_elimina_proyectos(): void
    {
        $tutora = $this->docente('mlopez');
        $proyecto = $this->proyecto($this->estudiante('jperez'), $tutora);

        $this->como($tutora->usuario)->deleteJson("/api/v1/proyectos/{$proyecto->id}")->assertForbidden();
    }

    public function test_filtro_miembro_id_incluye_proyectos_donde_no_es_autor(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $propio = $this->proyecto($juan);
        $deLucia = $this->proyecto($lucia);
        $deLucia->miembros()->create(['estudiante_id' => $juan->id, 'rol' => 'Analisis de datos', 'es_lider' => false]);
        $this->proyecto($this->estudiante('danez'));

        $ids = $this->como($juan->usuario)
            ->getJson("/api/v1/proyectos?miembro_id={$juan->id}")
            ->assertOk()
            ->json('data.*.id');

        $this->assertEqualsCanonicalizing([$propio->id, $deLucia->id], $ids);

        $this->como($juan->usuario)
            ->getJson("/api/v1/proyectos?estudiante_id={$juan->id}")
            ->assertJsonCount(1, 'data');
    }
}
