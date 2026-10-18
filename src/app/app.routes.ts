import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { HomeComponent } from './core/layout/home.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Giriş',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  { path: '', redirectTo:"home",  pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [authGuard], pathMatch: "full" }, 
  {
    path: 'users',
    title: 'Kullanıcılar',
    canActivate: [authGuard], // UX önlemi; gerçek yetki kontrolü API'de ([Authorize])
    loadChildren: () => import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
  },
  //{ path: 'users/:id', component: UserDetail, canActivate: [authGuard], pathMatch: "full" }, 
  /*{
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo:"home",  pathMatch: 'full' },
      { path: 'home', component: HomeComponent, canActivate: [authGuard], pathMatch: "full" },
    ]
  },*/
  { path: '**', redirectTo: 'login' }
];
