// src/app/services/favorites.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dish } from './dishes.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoriteIds: number[] = [];
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private toastService: ToastService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Charger les favoris depuis localStorage
    if (this.isBrowser) {
      const saved = localStorage.getItem('favorites');
      if (saved) {
        try {
          this.favoriteIds = JSON.parse(saved);
          this.favoritesSubject.next(this.favoriteIds);
        } catch (e) {
          console.error('Erreur lors du chargement des favoris:', e);
        }
      }
    }
  }

  getFavorites(): Observable<number[]> {
    return this.favoritesSubject.asObservable();
  }

  isFavorite(dishId: number): boolean {
    return this.favoriteIds.includes(dishId);
  }

  toggleFavorite(dish: Dish): void {
    const index = this.favoriteIds.indexOf(dish.id);
    
    if (index > -1) {
      // Retirer des favoris
      this.favoriteIds.splice(index, 1);
      this.toastService.info(`${dish.name} retiré des favoris`);
    } else {
      // Ajouter aux favoris
      this.favoriteIds.push(dish.id);
      this.toastService.success(`${dish.name} ajouté aux favoris`);
    }
    
    this.updateFavorites();
  }

  getFavoriteCount(): number {
    return this.favoriteIds.length;
  }

  clearFavorites(): void {
    this.favoriteIds = [];
    this.updateFavorites();
  }

  private updateFavorites(): void {
    this.favoritesSubject.next(this.favoriteIds);
    
    if (this.isBrowser) {
      try {
        localStorage.setItem('favorites', JSON.stringify(this.favoriteIds));
      } catch (e) {
        console.error('Erreur lors de la sauvegarde des favoris:', e);
      }
    }
  }
}