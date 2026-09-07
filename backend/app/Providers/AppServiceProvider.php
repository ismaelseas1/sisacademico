<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Scramble restringe /docs/api fuera del entorno local. Este gate
        // permite exponer la documentacion en el servidor desplegado.
        Gate::define('viewApiDocs', fn ($usuario = null) => (bool) config('app.docs_public'));

        // Declara en la documentacion OpenAPI que la API se autentica
        // con un token Bearer, para que el "Try it" pueda enviarlo.
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->secure(
                    SecurityScheme::http('bearer')
                        ->setDescription('Token emitido por POST /api/v1/login')
                );
            });
    }
}
