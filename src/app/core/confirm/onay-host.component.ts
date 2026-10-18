import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { OnayServisi } from './onay.servisi';

@Component({
  selector: 'app-onay-host',
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [acik]="onay.durum() !== null"
      [baslik]="onay.durum()?.baslik ?? ''"
      (kapat)="onay.cevapla(false)"
    >
      <p class="modal__metin">{{ onay.durum()?.mesaj }}</p>

      <div modal-alt>
        <button type="button" class="dugme dugme--ikincil" (click)="onay.cevapla(false)">
          Vazgeç
        </button>
        <button type="button" class="dugme dugme--tehlike" (click)="onay.cevapla(true)">
          {{ onay.durum()?.onayMetni }}
        </button>
      </div>
    </app-modal>
  `
})
export class OnayHostComponent {
  protected readonly onay = inject(OnayServisi);
}
