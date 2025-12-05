// src/app/pages/menu/menu.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DishesService, Dish } from '../../services/dishes.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  allDishes: Dish[] = [];
  filteredDishes: Dish[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';

  categories = [
    { id: 'all', name: 'Tous', icon: '🍽️' },
    { id: 'attieke', name: 'Attiéké', icon: '🍚' },
    { id: 'foutou', name: 'Foutou', icon: '☕' },
    { id: 'alloco', name: 'Alloco', icon: '🍌' },
    { id: 'sauce', name: 'Sauces', icon: '🥘' }
  ];

  constructor(
    private dishesService: DishesService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dishesService.getAllDishes().subscribe(dishes => {
      this.allDishes = dishes;
      this.filterDishes();
    });

    // Check for category parameter
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterDishes();
      }
    });
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterDishes();
  }

  onSearch(): void {
    this.filterDishes();
  }

  filterDishes(): void {
    let dishes = this.allDishes;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      dishes = dishes.filter(dish => dish.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      dishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(query) ||
        dish.nameEn.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query)
      );
    }

    this.filteredDishes = dishes;
  }

  isFavorite(dishId: number): boolean {
    return this.favoritesService.isFavorite(dishId);
  }

  toggleFavorite(dish: Dish, event: Event): void {
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

  getSpicyLevelText(level: number): string {
    const levels = ['Doux', 'Léger', 'Épicé', 'Très épicé', 'Extra', 'Extrême'];
    return levels[level] || '';
  }
}