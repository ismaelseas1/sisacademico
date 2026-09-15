<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes;

    protected $table = 'usuarios';

    /**
     * El modelo de datos define created_at y deleted_at, pero no
     * updated_at. Se anula UPDATED_AT para que Eloquent no intente
     * escribir una columna que no existe.
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

    /**
     * La contrasena nunca debe viajar en una respuesta de la API.
     */
    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            // Hashea la contrasena automaticamente al asignarla.
            'password' => 'hashed',
            'activo' => 'boolean',
            'ultimo_login' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(Auditoria::class, 'usuario_id');
    }

    /**
     * Indica si el usuario tiene alguno de los roles indicados.
     */
    public function tieneRol(string ...$nombres): bool
    {
        return in_array($this->rol?->nombre, $nombres, true);
    }
}
