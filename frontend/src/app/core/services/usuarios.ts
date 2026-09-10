import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(
    private http: HttpClient
  ) {}

  listarUsuarios(
    buscar:string='',
    pagina:number=1
  ){

    let params=new HttpParams()
      .set('buscar',buscar)
      .set('page',pagina);

    return this.http.get<any>(
      this.apiUrl,
      {params}
    );

  }

  obtenerUsuario(id:number){

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }

  crearUsuario(datos:any){

    return this.http.post<any>(
      this.apiUrl,
      datos
    );

  }

  actualizarUsuario(id:number,datos:any){

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      datos
    );

  }

  eliminarUsuario(id:number){

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}