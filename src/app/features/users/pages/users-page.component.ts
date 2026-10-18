import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../core/auth/auth.service';
import { OnayServisi } from '../../../core/confirm/onay.servisi';
import { ModalComponent } from '../../../shared/ui/modal/modal.component';
import { Kullanici, KullaniciEkleIstegi } from '../data-access/kullanici.model';
import { UsersStore } from '../data-access/users.store';
import { UserFormComponent } from '../ui/user-form.component';
import { UserListComponent } from '../ui/user-list.component';

/** Smart (container) component: store, onay ve yetki bilgisiyle konuşur; ekranı dumb parçalar çizer. */
@Component({
  selector: 'app-users-page',
  imports: [ReactiveFormsModule, UserListComponent, UserFormComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sayfa">
      <header class="sayfa__baslik">
        <div>
          <h1>Kullanıcılar</h1>
          <p class="soluk">{{ store.adet() }} kayıt</p>
        </div>

        <!-- Yalnızca UX: asıl yetki kontrolü API'de (YonetimYetkisi policy) -->
        @if (auth.adminMi()) {
          <button type="button" class="dugme dugme--birincil" (click)="formuAc()">
            Yeni kullanıcı
          </button>
        }
      </header>

      <div class="alan alan--arama">
        <label class="gorunmez" for="arama">Kullanıcı ara</label>
        <input
          id="arama"
          class="girdi"
          type="search"
          placeholder="Ada göre ara"
          autocomplete="off"
          [formControl]="aramaKutusu"
        />
      </div>

      @if (store.hata(); as hata) {
        <p class="hata-kutu" role="alert">
          {{ hata }}
          <button type="button" class="dugme dugme--metin" (click)="store.yenile()">
            Tekrar dene
          </button>
        </p>
      }

      @if (store.yukleniyor() && store.kullanicilar().length === 0) {
        <p class="durum" aria-live="polite">Yükleniyor…</p>
      } @else {
        <app-user-list
          [kullanicilar]="store.kullanicilar()"
          [silinebilir]="auth.adminMi()"
          [bosMesaji]="bosMesaji()"
          (sil)="silmeyiIste($event)"
        />
      }
    </section>

    @if (formAcik()) {
      <app-modal [acik]="true" baslik="Yeni kullanıcı" (kapat)="formuKapat()">
        <app-user-form
          [hata]="store.formHatasi()"
          [gonderiliyor]="store.gonderiliyor()"
          (kaydet)="kaydet($event)"
          (iptal)="formuKapat()"
        />
      </app-modal>
    }
  `
})
export class UsersPageComponent {
  protected readonly store = inject(UsersStore);
  protected readonly auth = inject(AuthService);
  private readonly onay = inject(OnayServisi);

  protected readonly aramaKutusu = new FormControl('', { nonNullable: true });
  protected readonly formAcik = signal(false);

  constructor() {
    this.aramaKutusu.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((metin) => this.store.ara(metin));
  }

  protected bosMesaji(): string {
    if (this.aramaKutusu.value.trim()) return 'Aramayla eşleşen kullanıcı yok.';
    return this.auth.adminMi()
      ? 'Henüz kullanıcı yok. “Yeni kullanıcı” ile ilkini ekle.'
      : 'Henüz kullanıcı yok.';
  }

  protected formuAc(): void {
    this.store.formHatasiniTemizle();
    this.formAcik.set(true);
  }

  protected formuKapat(): void {
    this.formAcik.set(false);
  }

  protected async kaydet(istek: KullaniciEkleIstegi): Promise<void> {
    const basarili = await this.store.ekle(istek);
    if (basarili) this.formuKapat();
  }

  protected async silmeyiIste(kullanici: Kullanici): Promise<void> {
    const eminMi = await this.onay.sor(
      `“${kullanici.ad}” kullanıcısı silinecek. Bu işlem geri alınamaz.`,
      'Kullanıcıyı sil',
      'Sil'
    );
    if (eminMi) await this.store.sil(kullanici.id);
  }
}
