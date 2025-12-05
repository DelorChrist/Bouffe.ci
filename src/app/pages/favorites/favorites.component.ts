// src/app/pages/favorites/favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DishesService, Dish } from '../../services/dishes.service';
import { FavoritesService } from '../../services/favorites.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
getSpicyLevelText(level: number): string {
  if (level === 1) return 'Doux';
  if (level === 2) return 'Épicé';
  if (level === 3) return 'Très épicé';
  if (level === 4) return '🔥🔥🔥 Extrême';
  return 'Non spécifié';
}

  favoriteDishes: Dish[] = [];
  isLoading = true;

  constructor(
    private dishesService: DishesService,
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    
    // S'abonner aux changements de favoris
    this.favoritesService.getFavorites().subscribe(() => {
      this.loadFavorites();
    });
  }

  loadFavorites(): void {
    this.isLoading = true;
    
    this.dishesService.getAllDishes().subscribe(allDishes => {
      this.favoritesService.getFavorites().subscribe(favoriteIds => {
        this.favoriteDishes = allDishes.filter(dish => 
          favoriteIds.includes(dish.id)
        );
        this.isLoading = false;
      });
    });
  }

  removeFavorite(dish: Dish, event: Event): void {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(dish);
  }

  addToCart(dish: Dish, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(dish);
    
    const target = event.target as HTMLElement;
    target.classList.add('added');
    setTimeout(() => target.classList.remove('added'), 600);
  }

  viewDish(dishId: number): void {
    this.router.navigate(['/dish', dishId]);
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }
}