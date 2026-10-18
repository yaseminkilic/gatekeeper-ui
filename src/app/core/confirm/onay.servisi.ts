import { Injectable, signal } from '@angular/core';

export interface OnayDurumu {
  baslik: string;
  mesaj: string;
  onayMetni: string;
}

/** `if (await onay.sor(...))` -> Promise<boolean> */
@Injectable({ providedIn: 'root' })
export class OnayServisi {
  private readonly _durum = signal<OnayDurumu | null>(null);
  readonly durum = this._durum.asReadonly();

  private cozum?: (deger: boolean) => void;

  sor(mesaj: string, baslik = 'Onay', onayMetni = 'Onayla'): Promise<boolean> {
    this.cozum?.(false); // Açıksa vazgeçildi say
    this._durum.set({ baslik, mesaj, onayMetni });
    return new Promise<boolean>((resolve) => (this.cozum = resolve));
  }

  cevapla(deger: boolean): void {
    this._durum.set(null);
    this.cozum?.(deger);
    this.cozum = undefined;
  }
}
