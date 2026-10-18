import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OnayHostComponent } from './core/confirm/onay-host.component';
import { ToastHostComponent } from './core/notification/toast-host.component';
import { Header } from './core/layout/header/header';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './core/layout/sidebar/sidebar';
import { Footer } from './core/layout/footer/footer';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer, ToastHostComponent, OnayHostComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
}
