import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api-url.token';
import { Kullanici, KullaniciEkleIstegi } from './kullanici.model';

/** Yalnızca HTTP bilir (Controller karşılığı istemci katmanı). */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/kullanicilar`;

  /** GET /api/kullanicilar?arama= (params, özel karakterleri otomatik encode eder) */
  getAll(arama = ''): Observable<Kullanici[]> {
    let params = new HttpParams();
    if (arama.trim()) params = params.set('arama', arama.trim());
    return this.http.get<Kullanici[]>(this.url, { params });
  }

  /** POST /api/kullanicilar -> 201 | 400 | 409 | 403 */
  create(istek: KullaniciEkleIstegi): Observable<Kullanici> {
    return this.http.post<Kullanici>(this.url, istek);
  }

  /** DELETE /api/kullanicilar/{id} -> 204 | 404 | 403 */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
