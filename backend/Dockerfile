# syntax=docker/dockerfile:1

# Imagen de produccion de la API del Sistema Academico.
# Sirve en cualquier plataforma de contenedores (Render, Railway, Fly.io).

FROM php:8.2-apache

# --- Extensiones de PHP -------------------------------------------------
# Se incluyen pdo_mysql y pdo_pgsql para poder usar indistintamente MySQL
# o PostgreSQL, segun la base que ofrezca la plataforma de despliegue.
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
        libpq-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        pdo_pgsql \
        zip \
        intl \
        bcmath \
        gd \
        opcache \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --- Apache -------------------------------------------------------------
RUN a2enmod rewrite headers
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf

# --- Ajustes de PHP para produccion ------------------------------------
COPY docker/php.ini /usr/local/etc/php/conf.d/99-app.ini

# --- Composer -----------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Las dependencias se instalan antes de copiar el codigo para que Docker
# reutilice esta capa mientras composer.lock no cambie.
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

COPY . .

# Los directorios se crean ANTES de dump-autoload, porque el script
# post-autoload-dump de Laravel (package:discover) escribe en
# bootstrap/cache. Se listan uno por uno a proposito: RUN usa /bin/sh
# (dash), que no soporta la expansion de llaves {a,b,c} de bash.
RUN mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && composer dump-autoload --optimize --no-dev --no-interaction \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080

ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
