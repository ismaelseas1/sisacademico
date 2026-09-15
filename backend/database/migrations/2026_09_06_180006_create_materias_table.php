<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carrera_id')->constrained('carreras')->cascadeOnDelete();
            $table->string('codigo', 20)->nullable()->unique();
            $table->string('nombre', 100);
            $table->integer('creditos')->nullable();
            $table->integer('semestre_materia')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materias');
    }
};
