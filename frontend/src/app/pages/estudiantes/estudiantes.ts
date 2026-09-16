import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from '../../core/services/estudiantes';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './estudiantes.html',
  styleUrls: ['./estudiantes.scss']
})
export class Estudiantes implements OnInit {

  estudiantes: any[] = [];

  busqueda = '';

  pagina = 1;

  totalPaginas = 1;

  cargando = false;

  constructor(
    private estudiantesService: EstudiantesService
  ) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {

    this.cargando = true;

    this.estudiantesService
      .listarEstudiantes(this.busqueda, this.pagina)
      .subscribe({

        next: (resp) => {

          this.estudiantes = resp.data ?? [];
          this.totalPaginas = resp.meta?.last_page ?? 1;

          this.cargando = false;

        },

        error: (err) => {

          console.error(err);

          this.cargando = false;

        }

      });

  }

}