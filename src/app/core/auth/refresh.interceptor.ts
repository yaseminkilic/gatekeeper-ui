import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { API_URL } from '../config/api-url.token';
import { authUcuMu } from './auth-ucu';
import { AuthService } from './auth.service';

/**
 * API 401 dönerse refresh cookie ile oturumu yeniler ve isteği yeni token ile tekrarlar.
 * Eşzamanlı 401'ler AuthService.yenile() içinde tek yenileme isteğinde birleşir.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiUrl = inject(API_URL);

  return next(req).pipe(
    catchError((hata: unknown) => {
      const yenilenebilir =
        hata instanceof HttpErrorResponse &&
        hata.status === 401 &&
        req.url.startsWith(apiUrl) &&
        !authUcuMu(req.url);

      if (!yenilenebilir) return throwError(() => hata);

      return auth.yenile().pipe(
        // Yalnızca YENİLEME hatası oturumu kapatır; tekrar denenen isteğin hatası değil.
        catchError((yenilemeHatasi) => {
          auth.yerelCikis();
          void router.navigate(['/login']);
          return throwError(() => yenilemeHatasi);
        }),
        switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })))
      );
    })
  );
};
