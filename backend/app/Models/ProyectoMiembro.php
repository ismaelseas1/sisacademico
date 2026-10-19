<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProyectoMiembro extends Model
{
    protected $table = 'proyectos_miembros';

    /** El diagrama no define marcas de tiempo para esta tabla. */
    public $timestamps = false;

    protected $fillable = [
        'proyecto_id',
        'estudiante_id',
        'rol',
        'es_lider',
    ];

    protected function casts(): array
    {
        return ['es_lider' => 'boolean'];
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id');
    }

    public function estudiante(): BelongsTo
    {
        return $this->belongsTo(Estudiante::class, 'estudiante_id');
    }
}
