import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('başarılı girişte token saklar', () => {
    auth.login({ kullaniciAdi: 'ali', sifre: '12345678' }).subscribe();

    const istek = http.expectOne('/api/auth/login');
    expect(istek.request.method).toBe('POST');
    expect(istek.request.withCredentials).toBe(true);
    istek.flush({ authToken: 'abc', expiresIn: 600 });

    expect(auth.token()).toBe('abc');
    expect(auth.oturumVar()).toBe(true);
    expect(sessionStorage.getItem('authToken')).toBe('abc');
  });

  it('hatalı girişte token saklamaz', () => {
    let durum = 0;
    auth.login({ kullaniciAdi: 'x', sifre: 'y' }).subscribe({ error: (e) => (durum = e.status) });

    http.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(durum).toBe(401);
    expect(auth.token()).toBeNull();
  });

  it('eşzamanlı yenileme çağrıları TEK istekte birleşir', () => {
    const sonuclar: string[] = [];
    auth.yenile().subscribe((t) => sonuclar.push(t));
    auth.yenile().subscribe((t) => sonuclar.push(t));
    auth.yenile().subscribe((t) => sonuclar.push(t));

    http.expectOne('/api/auth/refresh').flush({ authToken: 'yeni', expiresIn: 600 });

    expect(sonuclar).toEqual(['yeni', 'yeni', 'yeni']);
    expect(auth.token()).toBe('yeni');
  });

  it('yenileme bittikten sonra yeni çağrı yeni istek atar', () => {
    auth.yenile().subscribe();
    http.expectOne('/api/auth/refresh').flush({ authToken: 'a', expiresIn: 600 });

    auth.yenile().subscribe();
    http.expectOne('/api/auth/refresh').flush({ authToken: 'b', expiresIn: 600 });

    expect(auth.token()).toBe('b');
  });

  it('çıkışta sunucu hatası olsa bile yerel oturum temizlenir', () => {
    sessionStorage.setItem('authToken', 'x');
    auth.yerelCikis();
    auth.cikis().subscribe();

    http.expectOne('/api/auth/logout').flush({}, { status: 500, statusText: 'Server Error' });

    expect(auth.oturumVar()).toBe(false);
    expect(sessionStorage.getItem('authToken')).toBeNull();
  });
});
