import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {

  menuAbierto = true;

  modoOscuro = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  cambiarMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cambiarTema() {
    this.modoOscuro = !this.modoOscuro;
  }

  cerrarSesion() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

}