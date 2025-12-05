// src/app/services/cart.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dish } from './dishes.service';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Charger le panier depuis localStorage uniquement dans le navigateur
    if (this.isBrowser) {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try {
          this.cartItems = JSON.parse(saved);
          this.cartSubject.next(this.cartItems);
          this.updateTotal();
        } catch (e) {
          console.error('Erreur lors du chargement du panier:', e);
        }
      }
    }
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getTotal(): Observable<number> {
    return this.totalSubject.asObservable();
  }

  addToCart(dish: Dish): void {
    const existingItem = this.cartItems.find(item => item.dish.id === dish.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({ dish, quantity: 1 });
    }
    
    this.updateCart();
  }

  removeFromCart(dishId: number): void {
    this.cartItems = this.cartItems.filter(item => item.dish.id !== dishId);
    this.updateCart();
  }

  updateQuantity(dishId: number, quantity: number): void {
    const item = this.cartItems.find(item => item.dish.id === dishId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(dishId);
      } else {
        item.quantity = quantity;
        this.updateCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  private updateCart(): void {
    this.cartSubject.next(this.cartItems);
    this.updateTotal();
    
    // Sauvegarder dans localStorage uniquement dans le navigateur
    if (this.isBrowser) {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde du panier:', e);
      }
    }
  }

  private updateTotal(): void {
    const total = this.cartItems.reduce(
      (sum, item) => sum + (item.dish.price * item.quantity),
      0
    );
    this.totalSubject.next(total);
  }
}