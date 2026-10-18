import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { KullaniciEkleIstegi } from '../data-access/kullanici.model';

type AlanAdi = 'ad' | 'kullaniciAdi' | 'sifre';

/**
 * Dumb form. Kurallar backend KullaniciEkleIstegi ile aynı (kullanıcı deneyimi içindir;
 * asıl doğrulama ve güvenlik sunucuda).
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="form" [formGroup]="form" (ngSubmit)="gonder()" novalidate>
      <div class="alan">
        <label class="alan__etiket" for="uf-ad">Ad soyad</label>
        <input id="uf-ad" class="girdi" type="text" formControlName="ad" autocomplete="off" />
        @if (hataMetni('ad'); as m) {
          <p class="alan__hata" role="alert">{{ m }}</p>
        }
      </div>

      <div class="alan">
        <label class="alan__etiket" for="uf-kadi">Kullanıcı adı</label>
        <input
          id="uf-kadi"
          class="girdi"
          type="text"
          formControlName="kullaniciAdi"
          autocomplete="off"
        />
        @if (hataMetni('kullaniciAdi'); as m) {
          <p class="alan__hata" role="alert">{{ m }}</p>
        }
      </div>

      <div class="alan">
        <label class="alan__etiket" for="uf-sifre">Şifre</label>
        <input
          id="uf-sifre"
          class="girdi"
          type="password"
          formControlName="sifre"
          autocomplete="new-password"
        />
        @if (hataMetni('sifre'); as m) {
          <p class="alan__hata" role="alert">{{ m }}</p>
        }
      </div>

      @if (hata(); as h) {
        <p class="form-hata" role="alert">{{ h }}</p>
      }

      <div class="form__alt">
        <button type="button" class="dugme dugme--ikincil" (click)="iptal.emit()">Vazgeç</button>
        <button type="submit" class="dugme dugme--birincil" [disabled]="gonderiliyor()">
          {{ gonderiliyor() ? 'Ekleniyor…' : 'Kullanıcıyı ekle' }}
        </button>
      </div>
    </form>
  `
})
export class UserFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly hata = input<string | null>(null);
  readonly gonderiliyor = input(false);
  readonly kaydet = output<KullaniciEkleIstegi>();
  readonly iptal = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    ad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    kullaniciAdi: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    sifre: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]]
  });

  protected hataMetni(alan: AlanAdi): string | null {
    const kontrol = this.form.controls[alan];
    if (!(kontrol.touched && kontrol.invalid)) return null;

    const e = kontrol.errors ?? {};
    if (e['required']) return 'Bu alan zorunlu.';
    if (e['minlength']) return `En az ${e['minlength'].requiredLength} karakter olmalı.`;
    if (e['maxlength']) return `En fazla ${e['maxlength'].requiredLength} karakter olabilir.`;
    return 'Geçersiz değer.';
  }

  protected gonder(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.kaydet.emit({ ad: v.ad.trim(), kullaniciAdi: v.kullaniciAdi.trim(), sifre: v.sifre });
  }
}
