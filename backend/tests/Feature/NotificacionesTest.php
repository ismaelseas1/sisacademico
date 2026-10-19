<?php

namespace Tests\Feature;

use App\Models\Dispositivo;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

class NotificacionesTest extends AppMovilTestCase
{
    private const URL_FCM = 'https://fcm.googleapis.com/v1/projects/academico-test/messages:send';

    protected function setUp(): void
    {
        parent::setUp();

        // Cuenta de servicio ficticia. La clave de tests/Fixtures solo sirve para
        // firmar en las pruebas (Google nunca la recibe: las llamadas estan simuladas).
        $pem = file_get_contents(base_path('tests/Fixtures/fcm-clave-de-prueba.pem'));

        config()->set('services.firebase', [
            'project_id' => null,
            'credentials' => null,
            'credentials_base64' => base64_encode(json_encode([
                'project_id' => 'academico-test',
                'client_email' => 'push@academico-test.iam.gserviceaccount.com',
                'private_key' => $pem,
            ])),
        ]);

        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'token-google', 'expires_in' => 3600]),
            'fcm.googleapis.com/*' => fn () => $this->respuestaFcm ?? Http::response(['name' => 'projects/academico-test/messages/1']),
        ]);
    }

    /** Respuesta simulada de FCM; null = envio correcto. */
    private $respuestaFcm = null;

    private function enviosConTipo(string $token, string $tipo): int
    {
        return Http::recorded(fn (Request $r) => $r->url() === self::URL_FCM
            && $r['message']['token'] === $token
            && $r['message']['data']['tipo'] === $tipo)->count();
    }

    public function test_registrar_dispositivo_y_reasignarlo_a_otra_cuenta(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');

        $this->como($juan->usuario)
            ->postJson('/api/v1/dispositivos', ['token' => 'fcm-123', 'plataforma' => 'android'])
            ->assertCreated();

        $this->como($lucia->usuario)
            ->postJson('/api/v1/dispositivos', ['token' => 'fcm-123', 'plataforma' => 'android'])
            ->assertOk();

        $this->assertSame($lucia->usuario_id, Dispositivo::where('token', 'fcm-123')->value('usuario_id'));
        $this->assertSame(1, Dispositivo::count());
    }

    public function test_quitar_dispositivo_al_cerrar_sesion(): void
    {
        $juan = $this->estudiante('jperez');
        $juan->usuario->dispositivos()->create(['token' => 'fcm-123']);

        $this->como($juan->usuario)->deleteJson('/api/v1/dispositivos', ['token' => 'fcm-123'])->assertOk();

        $this->assertSame(0, Dispositivo::count());
    }

    public function test_cambio_de_estado_notifica_a_los_miembros_y_no_al_tutor(): void
    {
        $juan = $this->estudiante('jperez');
        $tutora = $this->docente('mlopez');
        $proyecto = $this->proyecto($juan, $tutora);
        $juan->usuario->dispositivos()->create(['token' => 'celular-juan']);
        $tutora->usuario->dispositivos()->create(['token' => 'celular-tutora']);

        $this->como($tutora->usuario)
            ->putJson("/api/v1/proyectos/{$proyecto->id}", ['estado_id' => $this->estado('en progreso')])
            ->assertOk();

        Http::assertSent(fn (Request $r) => $r->url() === self::URL_FCM
            && $r['message']['token'] === 'celular-juan'
            && $r['message']['data']['tipo'] === 'estado_proyecto'
            && $r['message']['data']['proyecto_id'] === (string) $proyecto->id
            && str_contains($r['message']['notification']['body'], 'en progreso'));

        // La tutora hizo el cambio: no recibe ese aviso (si recibio el de asignacion al crearse).
        $this->assertSame(0, $this->enviosConTipo('celular-tutora', 'estado_proyecto'));
        $this->assertSame(1, $this->enviosConTipo('celular-juan', 'estado_proyecto'));
    }

    public function test_agregar_miembro_notifica_al_estudiante_agregado(): void
    {
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $proyecto = $this->proyecto($juan);
        $lucia->usuario->dispositivos()->create(['token' => 'celular-lucia']);

        $this->como($juan->usuario)
            ->postJson("/api/v1/proyectos/{$proyecto->id}/miembros", ['estudiante_id' => $lucia->id, 'rol' => 'Backend'])
            ->assertCreated();

        Http::assertSent(fn (Request $r) => ($r['message']['token'] ?? null) === 'celular-lucia'
            && $r['message']['data']['tipo'] === 'miembro_agregado');
    }

    public function test_token_invalido_se_elimina(): void
    {
        $this->respuestaFcm = Http::response(['error' => ['status' => 'NOT_FOUND', 'details' => [['errorCode' => 'UNREGISTERED']]]], 404);

        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $proyecto = $this->proyecto($juan);
        $lucia->usuario->dispositivos()->create(['token' => 'token-vencido']);

        $this->como($juan->usuario)
            ->postJson("/api/v1/proyectos/{$proyecto->id}/miembros", ['estudiante_id' => $lucia->id, 'rol' => 'Backend'])
            ->assertCreated();

        $this->assertSame(0, Dispositivo::count());
    }

    public function test_sin_credenciales_la_operacion_funciona_y_no_se_envia_nada(): void
    {
        config()->set('services.firebase.credentials_base64', null);
        $juan = $this->estudiante('jperez');
        $lucia = $this->estudiante('lgutierrez');
        $lucia->usuario->dispositivos()->create(['token' => 'celular-lucia']);

        $this->como($juan->usuario)
            ->postJson("/api/v1/proyectos/{$this->proyecto($juan)->id}/miembros", ['estudiante_id' => $lucia->id, 'rol' => 'Backend'])
            ->assertCreated();

        Http::assertNothingSent();
    }
}
