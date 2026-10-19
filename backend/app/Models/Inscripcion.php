<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';

    /** El diagrama solo define fecha_inscripcion. */
    public $timestamps = false;

    protected $fillable = [
        'estudiante_id',
        'materia_id',
        'fecha_inscripcion',
    ];

    protected function casts(): array
    {
        return [
            'estudiante_id' => 'integer',
            'materia_id' => 'integer',
            'fecha_inscripcion' => 'datetime',
        ];
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class, 'materia_id');
    }
}
