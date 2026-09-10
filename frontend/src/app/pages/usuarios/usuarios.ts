import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../core/services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class Usuarios {

  usuarios: any[] = [];

  usuariosFiltrados: any[] = [];

  busqueda = '';

  pagina = 1;

  totalPaginas = 1;

  cargando = false;

  mostrarModal = false;

  editando = false;

  usuarioSeleccionado: number | null = null;

  formulario = {

    username: '',

    email: '',

    password: '',

    rol_id: 1,

    activo: true

  };

  roles: any[] = [

    {
      id: 1,
      nombre: 'Administrador'
    }

  ];

  constructor(
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {

    this.cargarUsuarios();

  }

 cargarUsuarios(): void {

  this.cargando = true;

  this.usuariosService
    .listarUsuarios(this.busqueda, this.pagina)
    .subscribe({

      next: (respuesta: any) => {

        console.log('Usuarios:', respuesta);

        this.usuarios = respuesta.data;

        this.usuariosFiltrados = respuesta.data;

        this.totalPaginas = respuesta.meta.last_page;

        this.cargando = false;

      },

      error: (error: any) => {

        console.error(error);

        this.cargando = false;

      }

    });

}

 buscarUsuario(event: Event): void {

  const texto = (event.target as HTMLInputElement)
    .value
    .toLowerCase();

  this.usuariosFiltrados = this.usuarios.filter((usuario: any) =>

    usuario.username.toLowerCase().includes(texto) ||

    usuario.email.toLowerCase().includes(texto) ||

    usuario.rol.nombre.toLowerCase().includes(texto)

  );

}

 buscar(): void {

  this.pagina = 1;

  this.cargarUsuarios();

}

 cambiarPagina(numero: number): void {

  if (numero < 1) return;

  if (numero > this.totalPaginas) return;

  this.pagina = numero;

  this.cargarUsuarios();

}
  nuevoUsuario(): void {

    this.editando = false;

    this.usuarioSeleccionado = null;

    this.formulario = {

      username: '',

      email: '',

      password: '',

      rol_id: 1,

      activo: true

    };

    this.mostrarModal = true;

  }
guardarUsuario(): void {

  if (!this.formulario.username.trim()) {

    alert('Ingrese el nombre de usuario');

    return;

  }

  if (!this.formulario.email.trim()) {

    alert('Ingrese el correo');

    return;

  }

  if (!this.editando && !this.formulario.password.trim()) {

    alert('Ingrese la contraseña');

    return;

  }

  if (this.editando) {

    this.actualizarUsuario();

    return;

  }

  this.usuariosService
    .crearUsuario(this.formulario)
    .subscribe({

      next: (respuesta:any) => {

        alert('Usuario creado correctamente');

        this.cerrarModal();

        this.cargarUsuarios();

      },

      error: (error:any) => {

        console.error(error);

        if(error.error){

          console.log(error.error);

        }

        alert('No se pudo crear el usuario');

      }

    });

}
actualizarUsuario(): void {


  if(this.usuarioSeleccionado == null){

    return;

  }


  const datos = {

    username: this.formulario.username,

    email: this.formulario.email,

    rol_id: this.formulario.rol_id,

    activo: this.formulario.activo

  };


  this.usuariosService
  .actualizarUsuario(
    this.usuarioSeleccionado,
    datos
  )
  .subscribe({

    next:(respuesta)=>{


      alert('Usuario actualizado correctamente');


      this.cerrarModal();


      this.cargarUsuarios();


    },


    error:(error)=>{


      console.error(error);


      console.log(error.error);


      alert('Error al actualizar usuario');


    }


  });


}
eliminarUsuario(id:number): void {

  if (!confirm('¿Eliminar este usuario?')) {

    return;

  }

  this.usuariosService
    .eliminarUsuario(id)
    .subscribe({

      next: () => {

        alert('Usuario eliminado');

        this.cargarUsuarios();

      },

      error: (error:any) => {

        console.error(error);

        alert('No se pudo eliminar');

      }

    });

}
cambiarEstado(usuario:any): void {

  const datos = {

    username: usuario.username,

    email: usuario.email,

    rol_id: usuario.rol.id,

    activo: !usuario.activo

  };


  this.usuariosService
    .actualizarUsuario(usuario.id, datos)
    .subscribe({

      next: () => {

        usuario.activo = !usuario.activo;

      },

      error: (error:any) => {

        console.error(error);

        alert('No se pudo cambiar el estado');

      }

    });

}
 editar(usuario:any): void {

  this.editando = true;

  this.usuarioSeleccionado = usuario.id;


  this.formulario = {

    username: usuario.username,

    email: usuario.email,

    password: '',

    rol_id: usuario.rol.id,

    activo: usuario.activo

  };


  this.mostrarModal = true;

}

cerrarModal(): void {

  this.mostrarModal = false;

  this.formulario = {

    username: '',

    email: '',

    password: '',

    rol_id: 1,

    activo: true

  };

  this.usuarioSeleccionado = null;

}

}