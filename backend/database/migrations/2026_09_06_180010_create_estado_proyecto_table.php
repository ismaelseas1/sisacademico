<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // El diagrama define el PK de este catalogo como INT (no BIGINT).
        Schema::create('estado_proyecto', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nombre', 20)->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estado_proyecto');
    }
};
