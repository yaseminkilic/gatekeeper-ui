export type BildirimTuru = 'bilgi' | 'basari' | 'hata';

/** DI: toast, konsol, modal? app.config.ts'te seç, testte kontrol
 * (TypeScript interface'leri derlemede silindiği için abstract)
 */
export abstract class BildirimServisi {
  abstract goster(mesaj: string, tur?: BildirimTuru): void;
}
