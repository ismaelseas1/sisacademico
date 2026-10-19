<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;

    protected $table = 'usuarios';

    /**
     * El diagrama define created_at y deleted_at, pero no updated_at.
     * Se anula UPDATED_AT para que Eloquent no intente escribir esa columna.
     */
    const UPDATED_AT = null;

    protected $fillable = [
        'username',
        'password',
        'email',
        'rol_id',
        'activo',
        'ultimo_login',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'activo' => 'boolean',
            'ultimo_login' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function estudiante(): HasOne
    {
        return $this->hasOne(Estudiante::class, 'usuario_id');
    }

    public function docente(): HasOne
    {
        return $this->hasOne(Docente::class, 'usuario_id');
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(Auditoria::class, 'usuario_id');
    }

    /** Celulares donde la app movil recibe notificaciones push. */
    public function dispositivos(): HasMany
    {
        return $this->hasMany(Dispositivo::class, 'usuario_id');
    }

    /** Atajo para autorizacion por rol en policies y middleware. */
    public function tieneRol(string ...$nombres): bool
    {
        return in_array($this->rol?->nombre, $nombres, true);
    }
}
