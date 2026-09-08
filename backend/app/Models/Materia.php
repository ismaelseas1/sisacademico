<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Materia extends Model
{
    protected $table = 'materias';

    protected $fillable = [
        'carrera_id',
        'codigo',
        'nombre',
        'creditos',
        'semestre_materia',
    ];

    protected function casts(): array
    {
        return [
            'creditos' => 'integer',
            'semestre_materia' => 'integer',
        ];
    }

    public function carrera(): BelongsTo
    {
        return $this->belongsTo(Carrera::class, 'carrera_id');
    }

    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class, 'materia_id');
    }

    public function estudiantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'inscripciones', 'materia_id', 'estudiante_id')
            ->withPivot('fecha_inscripcion');
    }
}
