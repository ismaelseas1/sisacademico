<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Celular registrado para recibir notificaciones push (token de FCM). */
class Dispositivo extends Model
{
    protected $table = 'dispositivos';

    protected $fillable = [
        'usuario_id',
        'token',
        'plataforma',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
