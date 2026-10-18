import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Kullanıcı deneyimi GUARD, GÜVENLİK DEĞİL: asıl yetki API'de ([Authorize]).
 * Access token yoksa/süresi dolduysa refresh cookie ile sessizce oturumu yenilemeyi dene.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.girisYapmisMi()) return true;

  const girisSayfasi = router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return auth.yenile().pipe(
    map(() => true),
    catchError(() => of(girisSayfasi))
  );
};
