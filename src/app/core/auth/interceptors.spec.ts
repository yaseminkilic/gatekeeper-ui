import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { refreshInterceptor } from './refresh.interceptor';

describe('auth ve refresh interceptor zinciri', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('authToken', 'eski');

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
        provideHttpClientTesting()
      ]
    });

    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => http.verify());

  it('API isteğine Bearer token ekler', () => {
    client.get('/api/kullanicilar').subscribe();

    const istek = http.expectOne('/api/kullanicilar');
    expect(istek.request.headers.get('Authorization')).toBe('Bearer eski');
    istek.flush([]);
  });

  it('login ucuna ve harici adrese token eklemez', () => {
    client.post('/api/auth/login', {}).subscribe();
    const login = http.expectOne('/api/auth/login');
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({});

    client.get('https://baska-site.example/veri').subscribe();
    const harici = http.expectOne('https://baska-site.example/veri');
    expect(harici.request.headers.has('Authorization')).toBe(false);
    harici.flush({});
  });

  it('401 gelince oturumu yeniler ve isteği yeni token ile tekrarlar', () => {
    let sonuc: unknown;
    client.get('/api/kullanicilar').subscribe((v) => (sonuc = v));

    http.expectOne('/api/kullanicilar').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({ authToken: 'yeni', expiresIn: 600 });

    const tekrar = http.expectOne('/api/kullanicilar');
    expect(tekrar.request.headers.get('Authorization')).toBe('Bearer yeni');
    tekrar.flush([{ id: 1, ad: 'Ali' }]);

    expect(sonuc).toEqual([{ id: 1, ad: 'Ali' }]);
  });

  it('aynı anda gelen 401 yanıtları için yalnızca bir yenileme isteği atılır', () => {
    client.get('/api/a').subscribe();
    client.get('/api/b').subscribe();
    client.get('/api/c').subscribe();

    for (const yol of ['/api/a', '/api/b', '/api/c']) {
      http.expectOne(yol).flush({}, { status: 401, statusText: 'Unauthorized' });
    }

    http.expectOne('/api/auth/refresh').flush({ authToken: 'yeni', expiresIn: 600 });

    for (const yol of ['/api/a', '/api/b', '/api/c']) {
      const tekrar = http.expectOne(yol);
      expect(tekrar.request.headers.get('Authorization')).toBe('Bearer yeni');
      tekrar.flush({});
    }
  });

  it('yenileme başarısız olursa oturumu kapatır ve hatayı iletir', () => {
    let durum = 0;
    client.get('/api/kullanicilar').subscribe({ error: (e) => (durum = e.status) });

    http.expectOne('/api/kullanicilar').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(durum).toBe(401);
    expect(auth.oturumVar()).toBe(false);
  });

  it('tekrar denenen isteğin kendi hatası oturumu kapatmaz', () => {
    client.get('/api/kullanicilar').subscribe({ error: () => undefined });

    http.expectOne('/api/kullanicilar').flush({}, { status: 401, statusText: 'Unauthorized' });
    http.expectOne('/api/auth/refresh').flush({ authToken: 'yeni', expiresIn: 600 });
    http.expectOne('/api/kullanicilar').flush({}, { status: 500, statusText: 'Server Error' });

    expect(auth.token()).toBe('yeni');
  });
});
