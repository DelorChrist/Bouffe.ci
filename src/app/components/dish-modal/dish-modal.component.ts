// src/app/components/dish-modal/dish-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Dish } from '../../services/dishes.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-dish-modal',
  templateUrl: './dish-modal.component.html',
  styleUrls: ['./dish-modal.component.scss']
})
export class DishModalComponent implements OnInit {
  @Input() dish: Dish | null = null;
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  quantity: number = 1;
  selectedOptions: string[] = [];

  // Options supplémentaires
  sauceOptions = [
    { id: 'piment', name: 'Piment', price: 0 },
    { id: 'oignon', name: 'Sauce oignon', price: 100 },
    { id: 'tomate', name: 'Sauce tomate', price: 100 }
  ];

  sideOptions = [
    { id: 'alloco', name: 'Alloco en accompagnement', price: 500 },
    { id: 'plantain', name: 'Plantain bouilli', price: 300 }
  ];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  onClose(): void {
    document.body.style.overflow = 'auto';
    this.close.emit();
    this.resetModal();
  }

  resetModal(): void {
    this.quantity = 1;
    this.selectedOptions = [];
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  toggleOption(optionId: string): void {
    const index = this.selectedOptions.indexOf(optionId);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(optionId);
    }
  }

  isOptionSelected(optionId: string): boolean {
    return this.selectedOptions.includes(optionId);
  }

  getTotalPrice(): number {
    if (!this.dish) return 0;
    
    let total = this.dish.price * this.quantity;
    
    // Add selected options prices
    this.selectedOptions.forEach(optionId => {
      const sauce = this.sauceOptions.find(s => s.id === optionId);
      const side = this.sideOptions.find(s => s.id === optionId);
      const option = sauce || side;
      if (option) {
        total += option.price * this.quantity;
      }
    });
    
    return total;
  }

  addToCart(): void {
    if (!this.dish) return;
    
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.dish);
    }
    
    this.onClose();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}