import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastBildirim } from './toast-bildirim';

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-kutu">
      @for (m of toast.mesajlar(); track m.id) {
        <div
          class="toast"
          [class.toast--basari]="m.tur === 'basari'"
          [class.toast--hata]="m.tur === 'hata'"
          [attr.role]="m.tur === 'hata' ? 'alert' : 'status'"
          (click)="toast.kapat(m.id)"
        >
          {{ m.metin }}
        </div>
      }
    </div>
  `
})
export class ToastHostComponent {
  protected readonly toast = inject(ToastBildirim);
}
