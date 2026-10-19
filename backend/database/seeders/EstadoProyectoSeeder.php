<?php

namespace Database\Seeders;

use App\Models\EstadoProyecto;
use Illuminate\Database\Seeder;

class EstadoProyectoSeeder extends Seeder
{
    /**
     * Catalogo definido en el PDF: "EstadoProyecto: catalogo de estados
     * (pendiente, en progreso, finalizado)".
     */
    public function run(): void
    {
        foreach (['pendiente', 'en progreso', 'finalizado'] as $nombre) {
            EstadoProyecto::updateOrCreate(['nombre' => $nombre], ['nombre' => $nombre]);
        }
    }
}
