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
    this.cargarEstudiantes();
  }

  cargarEstudiantes(): void {

    this.cargando = true;

    this.estudiantesService
      .listarEstudiantes(this.busqueda, this.pagina)
      .subscribe({

        next: (respuesta: any) => {

          console.log(respuesta);

          this.estudiantes = respuesta.data;
          this.totalPaginas = respuesta.meta.last_page;

          this.cargando = false;

        },

        error: (error) => {

          console.error(error);

          this.cargando = false;

        }

      });

  }

  buscar(): void {

    this.pagina = 1;
    this.cargarEstudiantes();

  }

  cambiarPagina(numero: number): void {

    if (numero < 1 || numero > this.totalPaginas) return;

    this.pagina = numero;

    this.cargarEstudiantes();

  }

}