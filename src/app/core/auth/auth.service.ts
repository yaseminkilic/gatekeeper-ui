import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';

import { API_URL } from '../config/api-url.token';
import { LoginRequest, LoginResponse } from './auth.models';
import { jwtCoz, jwtSuresiDolduMu, rolleriOku } from './jwt.util';

const TOKEN_ANAHTARI = 'authToken';

function depodanOku(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_ANAHTARI);
  } catch {
    return null; // depolama kapalı ???
  }
}

function depoyaYaz(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_ANAHTARI, token);
    else sessionStorage.removeItem(TOKEN_ANAHTARI);
  } catch {}
}

/** Kimlik doğrulama durumu.
 * - Access token: sessionStorage (kısa ömürlü). XSS'e açıktır; (bilinçli).
 * - Refresh token: HttpOnly cookie, JS göremez; yalnızca /api/auth uçlarına gider.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly _token = signal<string | null>(depodanOku());
  readonly token = this._token.asReadonly();

  private readonly payload = computed(() => {
    const t = this._token();
    return t ? jwtCoz(t) : null;
  });

  readonly oturumVar = computed(() => this._token() !== null);
  readonly kullaniciAdi = computed(() => this.payload()?.unique_name ?? null);
  readonly roller = computed(() => rolleriOku(this.payload()));
  readonly adminMi = computed(() => this.roller().includes('Admin'));

  private yenileme$?: Observable<string>;

  /** Token var ve süresi dolmamış mı? (Reaktif değildir, guard için.) */
  girisYapmisMi(): boolean {
    const t = this._token();
    return !!t && !jwtSuresiDolduMu(t);
  }

  login(bilgi: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, bilgi, { withCredentials: true })
      .pipe(tap((yanit) => this.tokenKaydet(yanit.authToken)));
  }

  /** Refresh cookie'si ile yeni access token alır.
   * Aynı anda birden çok çağrı gelirse TEK istek atılır ve sonuç paylaşılır;
   * aksi halde refresh token rotation, ikinci isteği "iptal edilmiş token" say
   */
  yenile(): Observable<string> {
    if (!this.yenileme$) {
      this.yenileme$ = this.http
        .post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true })
        .pipe(
          tap((yanit) => this.tokenKaydet(yanit.authToken)),
          map((yanit) => yanit.authToken),
          finalize(() => (this.yenileme$ = undefined)),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this.yenileme$;
  }

  /** Sunucuda oturumu kapatır (refresh token iptal), her durumda yerel durumu temizler. */
  cikis(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
        finalize(() => this.yerelCikis())
      );
  }

  yerelCikis(): void {
    this.tokenKaydet(null);
  }

  private tokenKaydet(token: string | null): void {
    this._token.set(token);
    depoyaYaz(token);
  }
}
