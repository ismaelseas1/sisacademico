#!/bin/sh
set -e

# Las plataformas de despliegue asignan el puerto por variable de entorno.
: "${PORT:=8080}"
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

echo "==> Puerto: ${PORT}"
echo "==> Entorno: ${APP_ENV:-production}"

# Sin APP_KEY Laravel no puede cifrar; se genera una efimera para no
# dejar el contenedor caido, pero debe definirse en la plataforma.
if [ -z "${APP_KEY}" ]; then
    echo "==> ADVERTENCIA: APP_KEY no definida. Generando una temporal."
    echo "    Los tokens y datos cifrados se invalidan en cada reinicio."
    echo "    Defina APP_KEY en las variables de entorno del servicio."
    export APP_KEY="base64:$(head -c 32 /dev/urandom | base64)"
fi

echo "==> Cacheando configuracion, rutas y vistas"
php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "==> Ejecutando migraciones"
    php artisan migrate --force
fi

# Los seeders usan updateOrCreate, por lo que repetirlos es inofensivo.
if [ "${RUN_SEED:-true}" = "true" ]; then
    echo "==> Cargando catalogos y administrador inicial"
    php artisan db:seed --force
fi

if [ "${RUN_DEMO_SEED:-false}" = "true" ]; then
    echo "==> Cargando datos de demostracion"
    php artisan db:seed --class=DemoSeeder --force
fi

echo "==> Iniciando servidor"
exec "$@"
