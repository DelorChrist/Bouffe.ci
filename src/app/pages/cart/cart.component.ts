// src/app/pages/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  deliveryFee = 500;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
    });

    this.cartService.getTotal().subscribe(total => {
      this.total = total;
    });
  }

  updateQuantity(dishId: number, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(dishId, quantity);
  }

  removeItem(dishId: number): void {
    this.cartService.removeFromCart(dishId);
  }

  getTotalWithDelivery(): number {
    return this.total + (this.cartItems.length > 0 ? this.deliveryFee : 0);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/menu']);
  }
}