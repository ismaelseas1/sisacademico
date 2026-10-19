<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->unique()->constrained('usuarios')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->string('registro', 32)->unique();
            $table->foreignId('carrera_id')->constrained('carreras')->restrictOnDelete();
            $table->integer('semestre');
            $table->date('fecha_nacimiento')->nullable();
            $table->decimal('ppa', 3, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};
