import { Injectable } from '@angular/core';

import { BildirimServisi, BildirimTuru } from './bildirim.servisi';

/** app.config.ts'te useExisting hedef Konsol */
@Injectable({ providedIn: 'root' })
export class KonsolBildirim extends BildirimServisi {
  goster(mesaj: string, tur: BildirimTuru = 'bilgi'): void {
    console.log(`[Bildirim:${tur}] ${mesaj}`);
  }
}
