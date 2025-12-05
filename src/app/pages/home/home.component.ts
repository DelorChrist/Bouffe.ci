// src/app/pages/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DishesService, Dish } from '../../services/dishes.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  popularDishes: Dish[] = [];
  categories = [
    { id: 'attieke', name: 'Attiéké', icon: '🍚', color: '#FFE8CC' },
    { id: 'foutou', name: 'Foutou', icon: '☕', color: '#FFD9A3' },
    { id: 'alloco', name: 'Alloco', icon: '🍌', color: '#FFC674' },
    { id: 'sauce', name: 'Sauces', icon: '🥘', color: '#FFE0B3' }
  ];

  constructor(
    private dishesService: DishesService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dishesService.getPopularDishes().subscribe(dishes => {
      this.popularDishes = dishes;
    });
  }

  addToCart(dish: Dish, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(dish);
    
    // Animation de feedback
    const target = event.target as HTMLElement;
    target.classList.add('added');
    setTimeout(() => target.classList.remove('added'), 600);
  }

  goToMenu(category?: string): void {
    if (category) {
      this.router.navigate(['/menu'], { queryParams: { category } });
    } else {
      this.router.navigate(['/menu']);
    }
  }
}