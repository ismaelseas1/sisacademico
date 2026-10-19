<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Docente extends Model
{
    protected $table = 'docentes';

    protected $fillable = [
        'usuario_id',
        'nombre',
        'especialidad',
        'facultad',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /** Proyectos que este docente tutorea. */
    public function proyectosTutorados(): HasMany
    {
        return $this->hasMany(Proyecto::class, 'tutor_id');
    }
}
