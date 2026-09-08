<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sistema Academico - Swagger UI</title>

    {{--
        La libreria se sirve desde public/vendor/swagger-ui en lugar de un CDN,
        para que la documentacion funcione sin conexion a internet y en
        cualquier maquina del equipo.
    --}}
    <link rel="stylesheet" href="{{ asset('vendor/swagger-ui/swagger-ui.min.css') }}">

    <style>
        body { margin: 0; background: #fafafa; }
        .topbar { display: none; }
        #carga {
            font-family: system-ui, sans-serif;
            color: #555;
            padding: 40px;
            font-size: 15px;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"><p id="carga">Cargando la documentacion...</p></div>

    <script src="{{ asset('vendor/swagger-ui/swagger-ui-bundle.min.js') }}"></script>
    <script src="{{ asset('vendor/swagger-ui/swagger-ui-standalone-preset.min.js') }}"></script>
    <script>
        window.onload = function () {
            var aviso = document.getElementById('carga');

            if (typeof SwaggerUIBundle === 'undefined') {
                aviso.textContent =
                    'No se pudo cargar la libreria de Swagger. Verifique que exista ' +
                    'la carpeta public/vendor/swagger-ui en el proyecto.';
                return;
            }

            window.ui = SwaggerUIBundle({
                // Ruta relativa a proposito: si fuera absoluta y el navegador
                // entrara por localhost mientras la ruta apunta a 127.0.0.1
                // (o al reves), las peticiones de "Try it out" saldrian hacia
                // otro origen y el navegador las bloquearia por CORS.
                url: '/docs/api.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                persistAuthorization: true,
                displayRequestDuration: true,
                docExpansion: 'list',
                filter: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset,
                ],
                layout: 'StandaloneLayout',
            });
        };
    </script>
</body>
</html>
