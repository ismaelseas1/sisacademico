import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../core/services/usuarios';


@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios {


  usuarios:any[] = [];


  constructor(
    private usuariosService: UsuariosService
  ){}


  ngOnInit(){

    this.cargarUsuarios();

  }


  cargarUsuarios(){

    this.usuariosService.listarUsuarios()
    .subscribe({

      next:(data:any)=>{

        console.log(
          "Usuarios Laravel:",
          data
        );

        this.usuarios = data;

      },


      error:(error:any)=>{

        console.error(
          "Error cargando usuarios",
          error
        );

      }

    });

  }


}