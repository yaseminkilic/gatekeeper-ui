import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Kullanici } from '../data-access/kullanici.model';

/** Dumb component: servis bilmesin, input al ve olay yay. */
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="tablo">
      <caption class="gorunmez">Kullanıcı listesi</caption>
      <thead>
        <tr>
          <th scope="col">Ad</th>
          @if (silinebilir()) {
            <th scope="col" class="tablo__islem"><span class="gorunmez">İşlemler</span></th>
          }
        </tr>
      </thead>
      <tbody>
        @for (k of kullanicilar(); track k.id) {
          <tr>
            <td>{{ k.ad }}</td>
            @if (silinebilir()) {
              <td class="tablo__islem">
                <button type="button" class="dugme dugme--metin dugme--tehlike-metin" (click)="sil.emit(k)">
                  Sil
                </button>
              </td>
            }
          </tr>
        } @empty {
          <tr>
            <td [attr.colspan]="silinebilir() ? 2 : 1" class="bos">{{ bosMesaji() }}</td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class UserListComponent {
  readonly kullanicilar = input.required<Kullanici[]>();
  readonly silinebilir = input(false);
  readonly bosMesaji = input('Kayıt bulunamadı.');
  readonly sil = output<Kullanici>();
}
