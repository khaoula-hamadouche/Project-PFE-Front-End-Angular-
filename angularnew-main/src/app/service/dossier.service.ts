import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DossierService {
  private apiUrl = 'http://localhost:8085/api/dossiers';
  private passationUrl = 'http://localhost:8085/api/passations'; // API pour Enum

  constructor(private http: HttpClient) {}

  ajouterDossier(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }

  getPassations(): Observable<string[]> {
    return this.http.get<string[]>(this.passationUrl, {withCredentials: true});


  }

  getAllDossiers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`,{withCredentials: true});
  }}
