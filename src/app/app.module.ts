// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components existants
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ToastComponent } from './components/toast/toast.component';
import { DishModalComponent } from './components/dish-modal/dish-modal.component';
import { DishCardComponent } from './components/dish-card/dish-card.component';

// Pages existantes
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

// NOUVEAUX COMPOSANTS
import { RoleRegisterComponent } from './pages/role-register/role-register.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { RegistrationPendingComponent } from './pages/registration-pending/registration-pending.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ChefDashboardComponent } from './pages/chef-dashboard/chef-dashboard.component';
import { LivreurDashboardComponent } from './pages/livreur-dashboard/livreur-dashboard.component';

// Services existants
import { DishesService } from './services/dishes.service';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';
import { AuthService } from './services/auth.service';
import { FavoritesService } from './services/favorites.service';

// NOUVEAUX SERVICES
import { OrdersService } from './services/orders.service';
import { ChefDishesService } from './services/chef-dishes.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ChefGuard } from './guards/chef.guard';
import { LivreurGuard } from './guards/livreur.guard';
import { NotificationsPanelComponent } from './components/notifications-panel/notifications-panel.component';
import { ReviewModalComponent } from './components/review-modal/review-modal.component';
import { PromoCodesListComponent } from './components/promo-codes-list/promo-codes-list.component';
import { StockManagerComponent } from './pages/chef-dashboard/stock-manager/stock-manager.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoadingComponent,
    ToastComponent,
    DishModalComponent,
    DishCardComponent,
    HomeComponent,
    MenuComponent,
    CartComponent,
    CheckoutComponent,
    AboutComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    PartnersComponent,
    FavoritesComponent,
    DishDetailComponent,
    // NOUVEAUX
    RoleRegisterComponent,
    MyOrdersComponent,
    RegistrationPendingComponent,
    AdminDashboardComponent,
    ChefDashboardComponent,
    LivreurDashboardComponent,
    NotificationsPanelComponent,
    ReviewModalComponent,
    PromoCodesListComponent,
    StockManagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    DishesService,
    CartService,
    ToastService,
    AuthService,
    FavoritesService,
    // NOUVEAUX
    OrdersService,
    ChefDishesService,
    AuthGuard,
    AdminGuard,
    ChefGuard,
    LivreurGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }