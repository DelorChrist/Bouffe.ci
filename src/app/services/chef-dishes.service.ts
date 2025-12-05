// src/app/services/chef-dishes.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dish } from './dishes.service';

export type DishApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ChefDish extends Dish {
  chefId: string;
  chefName: string;
  approvalStatus: DishApprovalStatus;
  submittedAt: Date;
  approvedAt?: Date;
  rejectionReason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChefDishesService {
  private chefDishesSubject = new BehaviorSubject<ChefDish[]>([]);
  public chefDishes$ = this.chefDishesSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadChefDishes();
  }

  private loadChefDishes(): void {
    if (this.isBrowser) {
      const dishesJson = localStorage.getItem('chefDishes');
      const dishes = dishesJson ? JSON.parse(dishesJson) : [];
      this.chefDishesSubject.next(dishes);
    }
  }

  private saveChefDishes(dishes: ChefDish[]): void {
    if (this.isBrowser) {
      localStorage.setItem('chefDishes', JSON.stringify(dishes));
      this.chefDishesSubject.next(dishes);
    }
  }

  submitDish(dishData: {
    chefId: string;
    chefName: string;
    name: string;
    nameEn: string;
    description: string;
    price: number;
    image: string;
    category: 'attieke' | 'foutou' | 'alloco' | 'sauce';
    ingredients?: string[];
    preparationTime?: string;
    servings?: number;
    spicyLevel?: number;
  }): Observable<{ success: boolean; message: string; dish?: ChefDish }> {
    return new Observable(observer => {
      const newDish: ChefDish = {
        id: this.generateId(),
        ...dishData,
        popular: false,
        chefId: dishData.chefId,
        chefName: dishData.chefName,
        approvalStatus: 'pending',
        submittedAt: new Date()
      };

      const dishes = this.getAllChefDishes();
      dishes.push(newDish);
      this.saveChefDishes(dishes);

      observer.next({
        success: true,
        message: 'Plat soumis avec succès. En attente de validation.',
        dish: newDish
      });
      observer.complete();
    });
  }

  getChefDishes(chefId: string): Observable<ChefDish[]> {
    return new Observable(observer => {
      const dishes = this.getAllChefDishes().filter(dish => dish.chefId === chefId);
      observer.next(dishes);
      observer.complete();
    });
  }

  getPendingDishes(): ChefDish[] {
    return this.getAllChefDishes().filter(dish => dish.approvalStatus === 'pending');
  }

  getApprovedDishes(): ChefDish[] {
    return this.getAllChefDishes().filter(dish => dish.approvalStatus === 'approved');
  }

  approveDish(dishId: number): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const dishes = this.getAllChefDishes();
      const dishIndex = dishes.findIndex(d => d.id === dishId);

      if (dishIndex === -1) {
        observer.next({ success: false, message: 'Plat introuvable' });
        observer.complete();
        return;
      }

      dishes[dishIndex].approvalStatus = 'approved';
      dishes[dishIndex].approvedAt = new Date();
      delete dishes[dishIndex].rejectionReason;

      this.saveChefDishes(dishes);

      // Ajouter le plat au menu principal
      this.addToMainMenu(dishes[dishIndex]);

      observer.next({ success: true, message: 'Plat approuvé avec succès' });
      observer.complete();
    });
  }

  rejectDish(dishId: number, reason: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const dishes = this.getAllChefDishes();
      const dishIndex = dishes.findIndex(d => d.id === dishId);

      if (dishIndex === -1) {
        observer.next({ success: false, message: 'Plat introuvable' });
        observer.complete();
        return;
      }

      dishes[dishIndex].approvalStatus = 'rejected';
      dishes[dishIndex].rejectionReason = reason;

      this.saveChefDishes(dishes);

      observer.next({ success: true, message: 'Plat rejeté' });
      observer.complete();
    });
  }

  updateDish(dishId: number, updates: Partial<ChefDish>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const dishes = this.getAllChefDishes();
      const dishIndex = dishes.findIndex(d => d.id === dishId);

      if (dishIndex === -1) {
        observer.next({ success: false, message: 'Plat introuvable' });
        observer.complete();
        return;
      }

      // Si le plat était approuvé, repasser en pending après modification
      if (dishes[dishIndex].approvalStatus === 'approved') {
        updates.approvalStatus = 'pending';
        delete updates.approvedAt;
      }

      dishes[dishIndex] = { ...dishes[dishIndex], ...updates };
      this.saveChefDishes(dishes);

      observer.next({ success: true, message: 'Plat mis à jour avec succès' });
      observer.complete();
    });
  }

  deleteDish(dishId: number): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const dishes = this.getAllChefDishes();
      const filteredDishes = dishes.filter(d => d.id !== dishId);

      this.saveChefDishes(filteredDishes);

      observer.next({ success: true, message: 'Plat supprimé avec succès' });
      observer.complete();
    });
  }

  private addToMainMenu(dish: ChefDish): void {
    if (!this.isBrowser) return;

    // Récupérer le menu principal depuis DishesService
    const mainMenuJson = localStorage.getItem('mainMenu');
    const mainMenu = mainMenuJson ? JSON.parse(mainMenuJson) : [];

    // Ajouter le plat approuvé
    const { chefId, chefName, approvalStatus, submittedAt, approvedAt, rejectionReason, ...dishData } = dish;
    mainMenu.push(dishData);

    localStorage.setItem('mainMenu', JSON.stringify(mainMenu));
  }

  getAllChefDishes(): ChefDish[] {
    if (!this.isBrowser) return [];
    
    const dishesJson = localStorage.getItem('chefDishes');
    return dishesJson ? JSON.parse(dishesJson) : [];
  }

  private generateId(): number {
    return Date.now();
  }
}