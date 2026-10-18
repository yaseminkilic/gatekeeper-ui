import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './../../auth/auth.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly rolMetni = computed(() => (this.auth.adminMi() ? 'Yönetici' : 'Kullanıcı'));

  protected async cikis(): Promise<void> {
    await firstValueFrom(this.auth.cikis());
    await this.router.navigate(['/login']);
  }
}
