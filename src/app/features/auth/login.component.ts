import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { guvenliYonlendirme } from '../../core/auth/guvenli-yonlendirme';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    h2 { margin-bottom: 8px; color: #333; }
    p { margin-bottom: 24px; color: #666; font-size: 14px; }
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      color: #444;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    input.error { border-color: #dc3545; }
    .error-text { color: #dc3545; font-size: 12px; margin-top: 4px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; font-size: 14px; }
    button:disabled { background-color: #cccccc; cursor: not-allowed; }
  `],
  template: `
    <section class="giris">
      <form class="giris__kart" [formGroup]="form" (ngSubmit)="giris()" novalidate>
        <h1 class="giris__baslik">Giriş yap</h1>
        
        <!-- Email Field -->
        <div class="alan">
          <label class="alan__etiket" for="kullaniciAdi">Kullanıcı adı</label>
          <input
            id="kullaniciAdi"
            class="girdi"
            type="text"
            formControlName="kullaniciAdi"
            autocomplete="username"
          />
          @if (form.controls.kullaniciAdi.touched && form.controls.kullaniciAdi.invalid) {
            <p class="alan__hata" role="alert">Kullanıcı adını yaz.</p>
          }
        </div>
        
        <!-- Password Field -->
        <div class="alan">
          <label class="alan__etiket" for="sifre">Şifre</label>
          <input
            id="sifre"
            class="girdi"
            type="password"
            formControlName="sifre"
            autocomplete="current-password"
          />
          @if (form.controls.sifre.touched && form.controls.sifre.invalid) {
            <p class="alan__hata" role="alert">Şifreni yaz.</p>
          }
        </div>

        <!-- Error Message Box -->
        @if (hata()) {
          <p class="form-hata" role="alert">{{ hata() }}</p>
        }

        <!-- Submit Button -->
        <button type="submit" class="dugme dugme--birincil dugme--tam" [disabled]="yukleniyor() || form.invalid">
          {{ yukleniyor() ? 'Giriş yapılıyor…' : 'Giriş yap' }}
        </button>
      </form>
    </section>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly yukleniyor = signal(false);
  protected readonly hata = signal('');

  // Backend LoginRequest ([Required]).
  protected readonly form = this.fb.nonNullable.group({
    kullaniciAdi: ['', [Validators.required]],
    sifre: ['', [Validators.required]]
  });

  protected async giris(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.hata.set('');
    this.yukleniyor.set(true);

    try {
      await firstValueFrom(this.auth.login(this.form.getRawValue()));
      const hedef = guvenliYonlendirme(this.route.snapshot.queryParamMap.get('returnUrl'));
      await this.router.navigateByUrl(hedef);
    } catch (e) {
      const durum = e instanceof HttpErrorResponse ? e.status : -1;
      this.hata.set(
        durum === 401
          ? 'Kullanıcı adı veya şifre hatalı.'
          : durum === 429
            ? 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.'
            : durum === 0
              ? 'Sunucuya ulaşılamıyor.'
              : 'Giriş yapılamadı. Biraz sonra tekrar dene.'
      );
    } finally {
      this.yukleniyor.set(false);
    }
  }
}
