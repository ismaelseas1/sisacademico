<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyectos_miembros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->cascadeOnDelete();
            $table->string('rol', 50);
            $table->boolean('es_lider')->default(false);

            $table->unique(['proyecto_id', 'estudiante_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos_miembros');
    }
};
