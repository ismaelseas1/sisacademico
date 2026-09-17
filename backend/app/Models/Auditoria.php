<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Auditoria extends Model
{
    protected $table = 'auditoria';

    /** El diagrama usa la columna 'fecha' en lugar de created_at/updated_at. */
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'tabla',
        'registro_id',
        'detalles',
        'fecha',
    ];

    protected function casts(): array
    {
        return ['fecha' => 'datetime'];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
