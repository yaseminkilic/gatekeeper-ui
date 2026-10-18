import { InjectionToken } from '@angular/core';

/** API kök adresi. 
 * Geliştirmede dev proxy (proxy.conf.json), 
 * üretimde aynı origin üzerinden '/api' kullanılır.
 * Gerekirse app.config.ts içinde override edilebilir.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => '/api'
});
