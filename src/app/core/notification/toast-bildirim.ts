import { Injectable, signal } from '@angular/core';

import { BildirimServisi, BildirimTuru } from './bildirim.servisi';

export interface ToastMesaji {
  id: number;
  metin: string;
  tur: BildirimTuru;
}

@Injectable({ providedIn: 'root' })
export class ToastBildirim extends BildirimServisi {
  private sayac = 0;
  private readonly _mesajlar = signal<ToastMesaji[]>([]);
  readonly mesajlar = this._mesajlar.asReadonly();

  goster(metin: string, tur: BildirimTuru = 'bilgi'): void {
    const id = ++this.sayac;
    this._mesajlar.update((liste) => [...liste, { id, metin, tur }]);
    setTimeout(() => this.kapat(id), tur === 'hata' ? 6000 : 3500);
  }

  kapat(id: number): void {
    this._mesajlar.update((liste) => liste.filter((m) => m.id !== id));
  }
}
