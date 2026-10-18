import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { refreshInterceptor } from './core/auth/refresh.interceptor';
import { hataInterceptor } from './core/http/hata.interceptor';
import { BildirimServisi } from './core/notification/bildirim.servisi';
import { ToastBildirim } from './core/notification/toast-bildirim';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // istek auth -> refresh -> hata yönünde; yanıt hatası ters yönde
    provideHttpClient(
      withXhr(),
      withInterceptors([authInterceptor, refreshInterceptor, hataInterceptor]),
    ),

    // DI UseExisting: servis ve host AYNI
    { provide: BildirimServisi, useExisting: ToastBildirim },
  ],
};
