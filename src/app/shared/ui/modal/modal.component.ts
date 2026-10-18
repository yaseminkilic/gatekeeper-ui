import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild
} from '@angular/core';

/** modal (dumb): input al, output yay
 * Context <ng-content />, 
 * Butonlar [modal-alt]
 * Esc / out-click = KAPAT
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'escBasildi()' },
  template: `
    @if (acik()) {
      <div class="modal-arka" (click)="kapat.emit()">
        <div
          #kutu
          class="modal"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-label]="baslik()"
          (click)="$event.stopPropagation()"
          (keydown)="tusBasildi($event)"
        >
          <header class="modal__baslik">
            <h2 class="modal__baslik-metin">{{ baslik() }}</h2>
            <button type="button" class="modal__kapat" aria-label="Kapat" (click)="kapat.emit()">
              ×
            </button>
          </header>

          <div class="modal__icerik">
            <ng-content />
          </div>

          <footer class="modal__alt">
            <ng-content select="[modal-alt]" />
          </footer>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  readonly acik = input(false);
  readonly baslik = input('');
  readonly kapat = output<void>();

  private readonly kutu = viewChild<ElementRef<HTMLElement>>('kutu');
  private oncekiOdak: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.acik()) {
        this.oncekiOdak = document.activeElement as HTMLElement | null;
        setTimeout(() => this.kutu()?.nativeElement.focus());
      } else if (this.oncekiOdak) {
        this.oncekiOdak.focus();
        this.oncekiOdak = null;
      }
    });
  }

  protected escBasildi(): void {
    if (this.acik()) this.kapat.emit();
  }

  /** Tab ile odağın modal dışına çıkmasını engeller. */
  protected tusBasildi(olay: KeyboardEvent): void {
    if (olay.key !== 'Tab') return;
    const kutu = this.kutu()?.nativeElement;
    if (!kutu) return;

    const odaklanabilir = Array.from(
      kutu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    if (odaklanabilir.length === 0) {
      olay.preventDefault();
      kutu.focus();
      return;
    }

    const ilk = odaklanabilir[0];
    const son = odaklanabilir[odaklanabilir.length - 1];
    const aktif = document.activeElement;

    if (olay.shiftKey && (aktif === ilk || aktif === kutu)) {
      olay.preventDefault();
      son.focus();
    } else if (!olay.shiftKey && aktif === son) {
      olay.preventDefault();
      ilk.focus();
    }
  }
}
