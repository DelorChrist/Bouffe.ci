// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { MenuComponent } from './pages/menu/menu.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { DishDetailComponent } from './pages/dish-detail/dish-detail.component';

// NOUVEAUX
import { RoleRegisterComponent } from './pages/role-register/role-register.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { RegistrationPendingComponent } from './pages/registration-pending/registration-pending.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ChefDashboardComponent } from './pages/chef-dashboard/chef-dashboard.component';
import { LivreurDashboardComponent } from './pages/livreur-dashboard/livreur-dashboard.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ChefGuard } from './guards/chef.guard';
import { LivreurGuard } from './guards/livreur.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'cart', component: CartComponent },
  { path: 'about', component: AboutComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'dish/:id', component: DishDetailComponent },
  
  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RoleRegisterComponent }, // CHANGÉ ICI
  
  // Protected routes
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
  
  // Pending
  { path: 'registration-pending', component: RegistrationPendingComponent },
  
  // Dashboards
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'chef/dashboard', component: ChefDashboardComponent, canActivate: [ChefGuard] },
  { path: 'livreur/dashboard', component: LivreurDashboardComponent, canActivate: [LivreurGuard] },
  
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }