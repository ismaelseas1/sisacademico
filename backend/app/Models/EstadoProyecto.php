<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EstadoProyecto extends Model
{
    protected $table = 'estado_proyecto';

    /** Catalogo sin marcas de tiempo, con PK entera segun el diagrama. */
    public $timestamps = false;

    protected $fillable = ['nombre'];

    /** Id del estado con el que inicia todo proyecto (ver EstadoProyectoSeeder). */
    public static function idPendiente(): ?int
    {
        return static::where('nombre', 'pendiente')->value('id');
    }

    public function proyectos(): HasMany
    {
        return $this->hasMany(Proyecto::class, 'estado_id');
    }
}
