import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OnayHostComponent } from './core/confirm/onay-host.component';
import { ToastHostComponent } from './core/notification/toast-host.component';
import { Header } from './core/layout/header/header';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './core/layout/sidebar/sidebar';
import { Footer } from './core/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, ToastHostComponent, OnayHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  // protected readonly auth = inject(AuthService);
  // private readonly router = inject(Router);

  // protected readonly rolMetni = computed(() => (this.auth.adminMi() ? 'Yönetici' : 'Kullanıcı'));

  // protected async cikis(): Promise<void> {
  //   await firstValueFrom(this.auth.cikis());
  //   await this.router.navigate(['/login']);
  // }
}
