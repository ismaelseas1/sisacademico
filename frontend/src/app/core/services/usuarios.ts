import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {


  private apiUrl = `${environment.apiUrl}/usuarios`;


  constructor(
    private http: HttpClient
  ) {}


  listarUsuarios(){

    return this.http.get<any[]>(
      this.apiUrl
    );

  }


  crearUsuario(datos:any){

    return this.http.post(
      this.apiUrl,
      datos
    );

  }


  actualizarUsuario(id:number, datos:any){

    return this.http.put(
      `${this.apiUrl}/${id}`,
      datos
    );

  }


  eliminarUsuario(id:number){

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );

  }


}