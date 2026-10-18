import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { BildirimServisi, BildirimTuru } from '../../../core/notification/bildirim.servisi';
import { Kullanici, KullaniciEkleIstegi } from './kullanici.model';
import { UsersApi } from './users.api';
import { UsersStore } from './users.store';

class SahteApi {
  liste: Kullanici[] = [
    { id: 1, ad: 'Ali' },
    { id: 2, ad: 'Ayşe' }
  ];
  getAllHatasi = false;
  silSonucu: Observable<void> = of(undefined);
  ekleSonucu: Observable<Kullanici> = of({ id: 3, ad: 'Veli' });
  cagrilar: string[] = [];

  getAll(arama = ''): Observable<Kullanici[]> {
    this.cagrilar.push(arama);
    return this.getAllHatasi
      ? throwError(() => new HttpErrorResponse({ status: 500 }))
      : of(this.liste);
  }
  create(_istek: KullaniciEkleIstegi): Observable<Kullanici> {
    return this.ekleSonucu;
  }
  delete(_id: number): Observable<void> {
    return this.silSonucu;
  }
}

class SahteBildirim extends BildirimServisi {
  mesajlar: { mesaj: string; tur?: BildirimTuru }[] = [];
  goster(mesaj: string, tur?: BildirimTuru): void {
    this.mesajlar.push({ mesaj, tur });
  }
}

describe('UsersStore', () => {
  let api: SahteApi;
  let bildirim: SahteBildirim;

  function storeKur(): UsersStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: UsersApi, useValue: api },
        { provide: BildirimServisi, useValue: bildirim }
      ]
    });
    return TestBed.inject(UsersStore);
  }

  beforeEach(() => {
    api = new SahteApi();
    bildirim = new SahteBildirim();
  });

  it('oluşturulunca listeyi yükler', () => {
    const store = storeKur();

    expect(store.kullanicilar()).toEqual(api.liste);
    expect(store.adet()).toBe(2);
    expect(store.yukleniyor()).toBe(false);
    expect(store.hata()).toBeNull();
  });

  it('yükleme hatasında hata durumunu ayarlar ve liste boş kalır', () => {
    api.getAllHatasi = true;
    const store = storeKur();

    expect(store.hata()).toBe('Kullanıcılar yüklenemedi.');
    expect(store.kullanicilar()).toEqual([]);
    expect(store.yukleniyor()).toBe(false);
  });

  it('yenile() son aramayla listeyi tekrar çeker', () => {
    const store = storeKur();
    store.yenile();

    expect(api.cagrilar).toEqual(['', '']);
  });

  it('ekle() başarılıysa true döner, bildirim gösterir ve listeyi yeniler', async () => {
    const store = storeKur();

    const sonuc = await store.ekle({ ad: 'Veli', kullaniciAdi: 'veli', sifre: '12345678' });

    expect(sonuc).toBe(true);
    expect(bildirim.mesajlar).toEqual([{ mesaj: 'Kullanıcı eklendi.', tur: 'basari' }]);
    expect(api.cagrilar.length).toBe(2);
    expect(store.gonderiliyor()).toBe(false);
  });

  it('ekle() 409 alırsa sunucunun mesajını form hatası yapar', async () => {
    api.ekleSonucu = throwError(
      () =>
        new HttpErrorResponse({
          status: 409,
          error: { title: 'Bu kullanıcı adı zaten kayıtlı.' }
        })
    );
    const store = storeKur();

    const sonuc = await store.ekle({ ad: 'Ali', kullaniciAdi: 'ali', sifre: '12345678' });

    expect(sonuc).toBe(false);
    expect(store.formHatasi()).toBe('Bu kullanıcı adı zaten kayıtlı.');
  });

  it('ekle() 400 doğrulama hatasında alan mesajlarını birleştirir', async () => {
    api.ekleSonucu = throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          error: { errors: { Sifre: ['Şifre çok kısa.'], Ad: ['Ad zorunlu.'] } }
        })
    );
    const store = storeKur();

    await store.ekle({ ad: '', kullaniciAdi: 'x', sifre: '1' });

    expect(store.formHatasi()).toBe('Şifre çok kısa. Ad zorunlu.');
  });

  it('ekle() 403 alırsa form hatası koymaz (ortak mesajı interceptor gösterir)', async () => {
    api.ekleSonucu = throwError(() => new HttpErrorResponse({ status: 403 }));
    const store = storeKur();

    const sonuc = await store.ekle({ ad: 'Veli', kullaniciAdi: 'veli', sifre: '12345678' });

    expect(sonuc).toBe(false);
    expect(store.formHatasi()).toBeNull();
  });

  it('sil() başarılıysa kullanıcıyı listeden çıkarır', async () => {
    const store = storeKur();

    await store.sil(1);

    expect(store.kullanicilar()).toEqual([{ id: 2, ad: 'Ayşe' }]);
    expect(bildirim.mesajlar[0]).toEqual({ mesaj: 'Kullanıcı silindi.', tur: 'basari' });
  });

  it('sil() hata verirse listeyi değiştirmez', async () => {
    api.silSonucu = throwError(() => new HttpErrorResponse({ status: 500 }));
    const store = storeKur();

    await store.sil(1);

    expect(store.kullanicilar()).toEqual(api.liste);
  });

  it('sil() 404 alırsa bilgi verir ve listeyi yeniler', async () => {
    api.silSonucu = throwError(() => new HttpErrorResponse({ status: 404 }));
    const store = storeKur();

    await store.sil(99);

    expect(bildirim.mesajlar[0].mesaj).toBe('Kullanıcı zaten silinmiş.');
    expect(api.cagrilar.length).toBe(2);
  });
});
