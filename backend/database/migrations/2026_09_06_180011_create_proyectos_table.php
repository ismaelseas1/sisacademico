<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyectos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estudiante_id')->constrained('estudiantes')->cascadeOnDelete();
            $table->foreignId('tutor_id')->nullable()->constrained('docentes')->nullOnDelete();
            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            // estado_proyecto.id es INT, por eso la FK no puede ser foreignId() (BIGINT).
            $table->unsignedInteger('estado_id');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->timestamps();

            $table->foreign('estado_id')->references('id')->on('estado_proyecto')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
