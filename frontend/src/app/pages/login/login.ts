import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {


  identificador = '';
  password = '';


  constructor(
    private auth: Auth,
    private router: Router
  ) {}



  ingresar() {


    const datos = {

      identificador: this.identificador,

      password: this.password

    };


    console.log('Enviando datos:', datos);



    this.auth.login(datos).subscribe({



      next: (respuesta: any) => {


        console.log('Respuesta Laravel:', respuesta);



        localStorage.setItem(
          'token',
          respuesta.token
        );



        localStorage.setItem(
          'usuario',
          JSON.stringify(respuesta.usuario)
        );



        alert('Inicio de sesión correcto');



        this.router.navigate(['/dashboard']);



      },



      error: (error) => {


        console.error('Error Laravel:', error);



        alert('Usuario o contraseña incorrectos');



      }



    });



  }


}