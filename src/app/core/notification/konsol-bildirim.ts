import { Injectable } from '@angular/core';

import { BildirimServisi, BildirimTuru } from './bildirim.servisi';

/** İkinci uygulama: konsola yazar. app.config.ts'te useExisting hedefi değiştirilerek seçilir. */
@Injectable({ providedIn: 'root' })
export class KonsolBildirim extends BildirimServisi {
  goster(mesaj: string, tur: BildirimTuru = 'bilgi'): void {
    console.log(`[Bildirim:${tur}] ${mesaj}`);
  }
}
