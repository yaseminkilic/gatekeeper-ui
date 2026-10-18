export type BildirimTuru = 'bilgi' | 'basari' | 'hata';

/**
 * Soyutlama (Dependency Inversion). Tüketiciler yalnızca bunu bilir;
 * toast mu konsol mu olduğu app.config.ts'te seçilir, testte sahtesi verilir.
 * (TypeScript interface'leri derlemede silindiği için DI token'ı olarak abstract class kullanıyoruz.)
 */
export abstract class BildirimServisi {
  abstract goster(mesaj: string, tur?: BildirimTuru): void;
}
