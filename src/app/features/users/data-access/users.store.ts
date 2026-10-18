import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  merge,
  of,
  switchMap,
  tap
} from 'rxjs';

import { problemMesaji, problemOku } from '../../../core/http/problem-details';
import { BildirimServisi } from '../../../core/notification/bildirim.servisi';
import { Kullanici, KullaniciEkleIstegi } from './kullanici.model';
import { UsersApi } from './users.api';

/**
 * Signal tabanlı store: iç durum private, dışarıya salt okunur açılır (kapsülleme).
 * Arama: debounce + distinct + switchMap -> eski istek iptal edilir (yarış durumu yok).
 */
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(UsersApi);
  private readonly bildirim = inject(BildirimServisi);

  private readonly _kullanicilar = signal<Kullanici[]>([]);
  private readonly _yukleniyor = signal(false);
  private readonly _hata = signal<string | null>(null);
  private readonly _formHatasi = signal<string | null>(null);
  private readonly _gonderiliyor = signal(false);

  readonly kullanicilar = this._kullanicilar.asReadonly();
  readonly yukleniyor = this._yukleniyor.asReadonly();
  readonly hata = this._hata.asReadonly();
  readonly formHatasi = this._formHatasi.asReadonly();
  readonly gonderiliyor = this._gonderiliyor.asReadonly();
  readonly adet = computed(() => this._kullanicilar().length);

  private readonly arama$ = new Subject<string>();
  private readonly yenile$ = new Subject<void>();
  private sonArama = '';

  constructor() {
    const aramaAkisi$ = merge(of(''), this.arama$.pipe(debounceTime(300))).pipe(
      map((metin) => metin.trim()),
      distinctUntilChanged(),
      tap((metin) => (this.sonArama = metin))
    );
    const yenileAkisi$ = this.yenile$.pipe(map(() => this.sonArama));

    merge(aramaAkisi$, yenileAkisi$)
      .pipe(
        tap(() => {
          this._yukleniyor.set(true);
          this._hata.set(null);
        }),
        switchMap((metin) =>
          this.api.getAll(metin).pipe(
            // catchError İÇTE: hata gelse de ana akış yaşamaya devam eder.
            catchError(() => {
              this._hata.set('Kullanıcılar yüklenemedi.');
              return of(null);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((liste) => {
        if (liste) this._kullanicilar.set(liste);
        this._yukleniyor.set(false);
      });
  }

  /** Arama kutusundan çağrılır (debounce store içinde). */
  ara(metin: string): void {
    this.arama$.next(metin);
  }

  /** Mevcut aramayla listeyi yeniden çeker. */
  yenile(): void {
    this.yenile$.next();
  }

  formHatasiniTemizle(): void {
    this._formHatasi.set(null);
  }

  async ekle(istek: KullaniciEkleIstegi): Promise<boolean> {
    this._formHatasi.set(null);
    this._gonderiliyor.set(true);

    try {
      await firstValueFrom(this.api.create(istek));
      this.bildirim.goster('Kullanıcı eklendi.', 'basari');
      this.yenile();
      return true;
    } catch (e) {
      const h = e instanceof HttpErrorResponse ? e : null;
      // 0 / 403 / 5xx için ortak mesajı hata interceptor'ı zaten gösterdi.
      if (h && (h.status === 409 || h.status === 400 || h.status === 422)) {
        this._formHatasi.set(
          h.status === 409
            ? (problemOku(h)?.title ?? 'Bu kullanıcı adı zaten kayıtlı.')
            : problemMesaji(h, 'Girilen bilgiler geçersiz.')
        );
      } else if (!h || (h.status !== 0 && h.status !== 403 && h.status < 500)) {
        this._formHatasi.set('Kullanıcı eklenemedi.');
      }
      return false;
    } finally {
      this._gonderiliyor.set(false);
    }
  }

  async sil(id: number): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(id));
      this._kullanicilar.update((liste) => liste.filter((k) => k.id !== id));
      this.bildirim.goster('Kullanıcı silindi.', 'basari');
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.status === 404) {
        this.bildirim.goster('Kullanıcı zaten silinmiş.', 'bilgi');
        this.yenile();
      }
    }
  }
}
