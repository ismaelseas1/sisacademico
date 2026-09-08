<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estudiante extends Model
{
    protected $table = 'estudiantes';

    protected $fillable = [
        'usuario_id',
        'nombre',
        'registro',
        'carrera_id',
        'semestre',
        'fecha_nacimiento',
        'ppa',
    ];

    protected function casts(): array
    {
        return [
            'semestre' => 'integer',
            'fecha_nacimiento' => 'date',
            'ppa' => 'decimal:2',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'carrera_id');
    }

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'estudiante_id');
    }

    public function materias(): BelongsToMany
    {
        return $this->belongsToMany(Materia::class, 'inscripciones', 'estudiante_id', 'materia_id')
            ->withPivot('fecha_inscripcion');
    }

    /** Proyectos donde el estudiante es el autor principal. */
    public function proyectos(): HasMany
    {
        return $this->hasMany(Proyecto::class, 'estudiante_id');
    }

    /** Proyectos donde participa como miembro del equipo. */
    public function proyectosComoMiembro(): BelongsToMany
    {
        return $this->belongsToMany(Proyecto::class, 'proyectos_miembros', 'estudiante_id', 'proyecto_id')
            ->withPivot(['rol', 'es_lider']);
    }
}
