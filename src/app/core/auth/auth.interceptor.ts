import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_URL } from '../config/api-url.token';
import { authUcuMu } from './auth-ucu';
import { AuthService } from './auth.service';

/** Access token'ı yalnızca API için ekle (üçüncü tarafa sızmasın). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const apiUrl = inject(API_URL);

  if (!token || !req.url.startsWith(apiUrl) || authUcuMu(req.url)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
