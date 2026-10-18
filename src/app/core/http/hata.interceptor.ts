import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { BildirimServisi } from '../notification/bildirim.servisi';
import { problemOku } from './problem-details';

/**
 * Ortak hataları tek yerde kullanıcı diline çevirir.
 * 401'e dokunmaz (refresh interceptor'ın işi); 400/404/409 çağıran tarafta ele alınır.
 */
export const hataInterceptor: HttpInterceptorFn = (req, next) => {
  const bildirim = inject(BildirimServisi);

  return next(req).pipe(
    catchError((hata: unknown) => {
      if (hata instanceof HttpErrorResponse) {
        if (hata.status === 0) {
          bildirim.goster('Sunucuya ulaşılamıyor. Bağlantını kontrol et.', 'hata');
        } else if (hata.status === 403) {
          bildirim.goster('Bu işlem için yetkin yok.', 'hata');
        } else if (hata.status >= 500) {
          const kod = problemOku(hata)?.traceId;
          bildirim.goster(
            kod ? `Sunucu hatası oluştu. Destek kodu: ${kod}` : 'Sunucu hatası oluştu.',
            'hata'
          );
        }
      }
      return throwError(() => hata);
    })
  );
};
