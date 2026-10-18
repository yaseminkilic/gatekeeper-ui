# Kullanıcı Yönetimi: Angular istemcisi

**ASP.NET Core Web API** (JWT + refresh token rotation, EF Core, SQL Server) ile birebir uyumlu Angular 22 uygulaması.

## Çalıştırma

Gereksinim: Node.js 22.22.3+ / 24.15+ / 26+ (Angular CLI 22 gereksinimi)

```bash
npm install            # "edgesOut" hatası alırsan: npm install --legacy-peer-deps
npm start              # http://localhost:4200
```

/*  */
`proxy.conf.json` -> `target`, API url (şu an `https://localhost:44384`, `http://localhost:5000`).
Dev proxy ile Angular ve API **aynı origin**'(CORS yok, refresh cookie sorunsuz)

Cookie `Secure` olduğu için bazı tarayıcılarda `http://localhost` üzerinde saklanmayabilir; 
`ng serve --ssl`.

```bash
npm test               # Vitest ile birim testleri (31 test)
npm run build          # dist/kullanici-yonetimi/browser
```

Demo giriş: `user@example.com` / `User123!` `User` rolündeki hesapla ekle/sil butonları görünmez, API de 403 döner. `admin@example.com` / `Admin123!` kullan

## Backend sözleşmesi

| İstemci | Backend |
|---|---|
| `POST /api/auth/login` `{kullaniciAdi, sifre}` -> `{authToken, expiresIn}` + HttpOnly `refreshToken` cookie | `AuthController.Login` |
| `POST /api/auth/refresh` (cookie) -> `{authToken, expiresIn}` | `AuthController.Yenile` (rotation) |
| `POST /api/auth/logout` | `AuthController.Cikis` (refresh token iptal) |
| `GET /api/kullanicilar?arama=` -> `[{id, ad}]` | `KullanicilarController.Getir` (`AsNoTracking` + projeksiyon) |
| `POST /api/kullanicilar` `{ad, kullaniciAdi, sifre}` -> 201 / 400 / 409 / 403 | `Ekle` (`YonetimYetkisi` policy) |
| `DELETE /api/kullanicilar/{id}` -> 204 / 404 / 403 | `Sil` (`ExecuteDeleteAsync`) |

Hata biçimi: `ProblemDetails` (`title`, `errors`, `traceId`). Form doğrulama kuralları backend `KullaniciEkleIstegi` ile aynıdır.

## Yapı

```
src/app/
  core/
    auth/          auth.service (signal durum, tek-uçuş yenileme), auth.guard,
                   auth / refresh interceptor, jwt.util, guvenli-yonlendirme
    http/          hata.interceptor, problem-details
    notification/  BildirimServisi (soyut), ToastBildirim, KonsolBildirim, toast-host
    confirm/       OnayServisi (Promise<boolean>), onay-host
    config/        API_URL token
  shared/ui/modal  yeniden kullanılabilir modal (odak yönetimi, Esc, Tab tuzağı)
  features/
    auth/          login
    users/
      data-access/ users.api (HTTP), users.store (signal), modeller
      ui/          user-list, user-form (dumb)
      pages/       users-page (smart)
      users.routes.ts   <- lazy loading
```

## Tasarım kararları

- **Smart / dumb ayrımı:** `users-page` store ve onay servisiyle konuşur; liste ve form yalnızca `input`/`output` kullanır (`OnPush`).
- **Interceptor zinciri** (`app.config.ts`): `auth` (Bearer ekle) -> `refresh` (401'de yenile + tekrar dene) -> `hata` (kullanıcı dilinde mesaj). 401'i yalnızca `refresh` ele alır.
- **Tek-uçuş yenileme:** Aynı anda gelen 401'ler tek `/auth/refresh` isteğinde birleşir; rotation, ikinci isteği "çalıntı token" saymasın diye.
- **Dependency Inversion:** Bildirimin toast mu konsol mu olduğu yalnızca `app.config.ts`'te (`useExisting`) seçilir; store ve testler soyutlamaya bağlıdır.
- **Arama:** `debounceTime` + `distinctUntilChanged` + `switchMap`: eski istek iptal edilir, yarış durumu olmaz.
- **Formlar Reactive Forms ile yazıldı:** API'si kararlı ve mülakatta asıl sorulan yaklaşım. Signal Forms hâlâ deneysel olduğu için sürümler arasında değişebiliyor.
- **Güvenlik notları:**
  - Guard ve rol bazlı buton gizleme yalnızca kullanıcı deneyimidir; yetki kontrolü API'dedir.
  - Access token `sessionStorage`'dadır (XSS'e açık, bilinçli ödünleşim); refresh token HttpOnly cookie'dedir.
  - Token yalnızca `API_URL` ile başlayan isteklere eklenir; `returnUrl` open redirect'e karşı doğrulanır.
  - `bypassSecurityTrust...`, `innerHTML`, `eval` kullanılmaz.

## Sıkı CSP ile uyum

Backend `style-src 'self'` gönderdiği için **tüm stiller `src/styles.css` içindedir** (bileşenlerde satır içi `<style>` yok) ve üretim derlemesinde `inlineCritical` kapalıdır (`angular.json`). Bu yüzden uygulama, API'den sunulurken CSP ihlali üretmez.

## Üretim: Angular'ı ASP.NET Core'dan sunmak

`npm run build` çıktısını (`dist/kullanici-yonetimi/browser`) API projesinin `wwwroot` klasörüne kopyala:

```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.MapFallbackToFile("index.html");   // /users gibi SPA yollarını F5'te 404 yapmaz
```

Aynı origin olduğu için CORS gerekmez; `API_URL` varsayılanı (`/api`) olduğu gibi çalışır.

## BASIC NOTES
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.1.

### Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

### Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

### Dependency Security
```bash
npm audit
npm audit --omit=dev      # sadece üretime giren paketler
npm audit fix             # güvenli otomatik düzeltmeler
npm outdated              # eski paketleri listele
```

### Proxy Config Serve
```bash
ng serve --proxy-config proxy.conf.json
```