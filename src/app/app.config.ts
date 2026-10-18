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

    // Sıra önemli: istek auth -> refresh -> hata yönünde gider, yanıt hatası ters yönde döner.
    provideHttpClient(
      withXhr(),
      withInterceptors([authInterceptor, refreshInterceptor, hataInterceptor]),
    ),

    // Bildirimin nasıl gösterileceği yalnızca burada seçilir (Dependency Inversion).
    // useExisting: servis ve ekrandaki host AYNI örneği paylaşsın diye şart.
    { provide: BildirimServisi, useExisting: ToastBildirim },
  ],
};
