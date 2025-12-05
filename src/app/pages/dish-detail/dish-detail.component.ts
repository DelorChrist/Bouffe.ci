// src/app/pages/dish-detail/dish-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DishesService, Dish } from '../../services/dishes.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-dish-detail',
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss']
})
export class DishDetailComponent implements OnInit {
  dish: Dish | undefined;
  quantity: number = 1;
  isLoading: boolean = true;
  isFavorite: boolean = false;
  relatedDishes: Dish[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dishesService: DishesService,
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du plat depuis l'URL
    this.route.params.subscribe(params => {
      const dishId = +params['id'];
      this.loadDish(dishId);
    });
  }

  loadDish(id: number): void {
    this.isLoading = true;
    this.dish = this.dishesService.getDishById(id);
    
    if (!this.dish) {
      this.router.navigate(['/menu']);
      return;
    }

    this.isFavorite = this.favoritesService.isFavorite(id);
    this.loadRelatedDishes();
    this.isLoading = false;
  }

  loadRelatedDishes(): void {
    if (!this.dish) return;
    
    this.dishesService.getDishesByCategory(this.dish.category).subscribe(dishes => {
      this.relatedDishes = dishes
        .filter(d => d.id !== this.dish?.id)
        .slice(0, 3);
    });
  }

  toggleFavorite(): void {
    if (this.dish) {
      this.favoritesService.toggleFavorite(this.dish);
      this.isFavorite = !this.isFavorite;
    }
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.dish) return;
    
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.dish);
    }
    
    // Animation de feedback
    const button = document.querySelector('.add-to-cart-btn');
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 600);
    }
  }

  getSpicyLevelText(level: number): string {
    const levels = ['Doux', 'Légèrement épicé', 'Épicé', 'Très épicé', 'Extra piquant', 'Extrême'];
    return levels[level] || 'Non spécifié';
  }

  getSpicyIcons(level: number): string {
    return '🌶️'.repeat(level);
  }

  goBack(): void {
    this.router.navigate(['/menu']);
  }

  viewRelatedDish(dishId: number): void {
    this.router.navigate(['/dish', dishId]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}