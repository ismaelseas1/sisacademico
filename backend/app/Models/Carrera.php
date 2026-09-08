<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Carrera extends Model
{
    protected $table = 'carreras';

    protected $fillable = ['codigo', 'nombre', 'facultad_id', 'institucion'];

    public function facultad(): BelongsTo
    {
        return $this->belongsTo(Facultad::class, 'facultad_id');
    }

    public function materias(): HasMany
    {
        return $this->hasMany(Materia::class, 'carrera_id');
    }

    public function estudiantes(): HasMany
    {
        return $this->hasMany(Estudiante::class, 'carrera_id');
    }
}
