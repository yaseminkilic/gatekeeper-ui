/** Backend: record KullaniciDto(int Id, string Ad). Entity (SifreHash vb.) asla dönme. */
export interface Kullanici {
  id: number;
  ad: string;
}

/** Backend: Api.Contracts.KullaniciEkleIstegi (ad 3-100, kullaniciAdi 3-50, sifre 8-100). */
export interface KullaniciEkleIstegi {
  ad: string;
  kullaniciAdi: string;
  sifre: string;
}
