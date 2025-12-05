// src/app/pages/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  deliveryFee = 500;

  // Form data
  customerName = '';
  phone = '';
  address = '';
  notes = '';
  paymentMethod: 'mobile' | 'card' | 'cash' = 'mobile';

  // UI states
  isProcessing = false;
  orderComplete = false;
  orderNumber = '';

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/menu']);
      }
    });

    this.cartService.getTotal().subscribe(total => {
      this.total = total;
    });
  }

  getTotalWithDelivery(): number {
    return this.total + this.deliveryFee;
  }

  selectPaymentMethod(method: 'mobile' | 'card' | 'cash'): void {
    this.paymentMethod = method;
  }

  async submitOrder(): Promise<void> {
    if (!this.validateForm()) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isProcessing = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate order number
    this.orderNumber = 'BC' + Date.now().toString().slice(-8);

    this.isProcessing = false;
    this.orderComplete = true;

    // Clear cart
    this.cartService.clearCart();
  }

  validateForm(): boolean {
    return !!(
      this.customerName.trim() &&
      this.phone.trim() &&
      this.address.trim()
    );
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}