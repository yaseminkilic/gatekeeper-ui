import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <p>Giriş Ekranı</p>
  `,
  imports: []
})
export class HomeComponent {

}


/*
No provider for HttpClient: app.config.ts içinde provideHttpClient() yok.
is not a known element: kullanılan component imports listesinde eksik.
@defer çalışmıyor gibi görünüyorsa sayfa yeterince uzun değildir. Placeholder ilk ekranda görünüyorsa hemen yüklenir, o yüzden üstüne height:1200px’lik boşluk koydum.
Konsol logu görünmüyorsa tarayıcıda F12 → Console sekmesinde filtrelerin kapalı olduğundan emin ol.
*/