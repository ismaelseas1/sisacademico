<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Cliente minimo de Firebase Cloud Messaging (API HTTP v1).
 *
 * Se autentica con la cuenta de servicio del proyecto de Firebase: firma un JWT
 * con su clave privada y lo cambia por un access token de Google, que se guarda
 * en cache hasta poco antes de que venza. No requiere paquetes adicionales.
 *
 * Credenciales (config/services.php -> firebase):
 *   - FIREBASE_CREDENTIALS: ruta al JSON de la cuenta de servicio (desarrollo).
 *   - FIREBASE_CREDENTIALS_BASE64: el mismo JSON en base64 (Render u otro hosting).
 * Si no hay credenciales, el envio se omite sin romper la peticion.
 */
class FirebaseMessaging
{
    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    /** Resultado de un envio: entregado, token invalido (borrarlo) u otro error. */
    public const ENVIADO = 'enviado';
    public const TOKEN_INVALIDO = 'token_invalido';
    public const ERROR = 'error';

    private ?array $credenciales = null;

    public function configurado(): bool
    {
        return $this->credenciales() !== null;
    }

    /**
     * Envia una notificacion a un token.
     *
     * @param  array<string, string>  $datos  Pares clave/valor para la app (p. ej. tipo y proyecto_id).
     */
    public function enviar(string $token, string $titulo, string $cuerpo, array $datos = []): string
    {
        $credenciales = $this->credenciales();

        if ($credenciales === null) {
            return self::ERROR;
        }

        $respuesta = Http::withToken($this->accessToken($credenciales))
            ->acceptJson()
            ->post("https://fcm.googleapis.com/v1/projects/{$credenciales['project_id']}/messages:send", [
                'message' => [
                    'token' => $token,
                    'notification' => ['title' => $titulo, 'body' => $cuerpo],
                    'data' => array_map('strval', $datos),
                    'android' => ['priority' => 'high'],
                ],
            ]);

        if ($respuesta->successful()) {
            return self::ENVIADO;
        }

        $codigo = $respuesta->json('error.details.0.errorCode') ?? $respuesta->json('error.status');

        if ($respuesta->status() === 404 || in_array($codigo, ['UNREGISTERED', 'INVALID_ARGUMENT'], true)) {
            return self::TOKEN_INVALIDO;
        }

        Log::warning('FCM: no se pudo enviar la notificacion.', [
            'status' => $respuesta->status(),
            'error' => $respuesta->json('error.message'),
        ]);

        return self::ERROR;
    }

    private function accessToken(array $credenciales): string
    {
        return Cache::remember('fcm_access_token', now()->addMinutes(50), function () use ($credenciales) {
            $ahora = time();
            $jwt = $this->firmarJwt([
                'iss' => $credenciales['client_email'],
                'scope' => self::SCOPE,
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $ahora,
                'exp' => $ahora + 3600,
            ], $credenciales['private_key']);

            $respuesta = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (! $respuesta->successful() || ! $respuesta->json('access_token')) {
                throw new RuntimeException('FCM: Google rechazo la cuenta de servicio ('.$respuesta->status().').');
            }

            return $respuesta->json('access_token');
        });
    }

    private function firmarJwt(array $claims, string $clavePrivada): string
    {
        $codificar = fn (string $valor) => rtrim(strtr(base64_encode($valor), '+/', '-_'), '=');

        $entrada = $codificar(json_encode(['alg' => 'RS256', 'typ' => 'JWT']))
            .'.'.$codificar(json_encode($claims));

        if (! openssl_sign($entrada, $firma, $clavePrivada, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('FCM: no se pudo firmar el JWT con la clave de la cuenta de servicio.');
        }

        return $entrada.'.'.$codificar($firma);
    }

    /** @return array{project_id: string, client_email: string, private_key: string}|null */
    private function credenciales(): ?array
    {
        if ($this->credenciales !== null) {
            return $this->credenciales;
        }

        $json = null;
        $base64 = config('services.firebase.credentials_base64');
        $ruta = config('services.firebase.credentials');

        // Una ruta relativa se toma desde la raiz del backend, no desde public/.
        if ($ruta && ! preg_match('#^([a-zA-Z]:)?[\\\\/]#', $ruta)) {
            $ruta = base_path($ruta);
        }

        if ($base64) {
            $json = base64_decode($base64, true) ?: null;
        } elseif ($ruta && is_file($ruta)) {
            $json = file_get_contents($ruta);
        }

        $datos = $json ? json_decode($json, true) : null;

        if (! is_array($datos) || empty($datos['client_email']) || empty($datos['private_key'])) {
            return null;
        }

        $datos['project_id'] = config('services.firebase.project_id') ?: ($datos['project_id'] ?? null);

        return $datos['project_id'] ? $this->credenciales = $datos : null;
    }
}
