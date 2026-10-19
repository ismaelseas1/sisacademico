<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proyecto extends Model
{
    protected $table = 'proyectos';

    protected $fillable = [
        'estudiante_id',
        'tutor_id',
        'titulo',
        'descripcion',
        'estado_id',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected function casts(): array
    {
        return [
            'estudiante_id' => 'integer',
            'tutor_id' => 'integer',
            'estado_id' => 'integer',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /** Estudiante autor del proyecto. */
    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'tutor_id');
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(EstadoProyecto::class, 'estado_id');
    }

    public function miembros(): HasMany
    {
        return $this->hasMany(ProyectoMiembro::class, 'proyecto_id');
    }

    public function integrantes(): BelongsToMany
    {
        return $this->belongsToMany(Estudiante::class, 'proyectos_miembros', 'proyecto_id', 'estudiante_id')
            ->withPivot(['rol', 'es_lider']);
    }
}
