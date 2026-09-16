import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {

  private apiUrl = `${environment.apiUrl}/estudiantes`;

  constructor(
    private http: HttpClient
  ) {}

  listarEstudiantes(
    buscar: string = '',
    pagina: number = 1
  ) {

    const params = new HttpParams()
      .set('buscar', buscar)
      .set('page', pagina);

    return this.http.get<any>(
      this.apiUrl,
      { params }
    );

  }

  obtenerEstudiante(id: number) {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );

  }

  crearEstudiante(datos: any) {

    return this.http.post<any>(
      this.apiUrl,
      datos
    );

  }

  actualizarEstudiante(id: number, datos: any) {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      datos
    );

  }

  eliminarEstudiante(id: number) {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}