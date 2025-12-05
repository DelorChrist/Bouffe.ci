// src/app/components/header/header.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  cartCount = 0;
  isScrolled = false;
  isMenuOpen = false;
  currentUser: User | null = null;
  isUserMenuOpen = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
    this.isMenuOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  getDashboardLink(): string {
    if (!this.currentUser) return '/';
    
    switch(this.currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'chef':
        return '/chef/dashboard';
      case 'livreur':
        return '/livreur/dashboard';
      default:
        return '/';
    }
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.isUserMenuOpen && !target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
  }
}