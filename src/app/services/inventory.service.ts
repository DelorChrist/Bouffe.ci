// src/app/services/inventory.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DishInventory {
  dishId: number;
  chefId?: string;
  available: boolean;
  dailyLimit?: number; // Quantité disponible par jour
  currentStock: number; // Quantité restante aujourd'hui
  lastRestocked: Date;
  autoRestock: boolean; // Réapprovisionner automatiquement chaque jour
  unavailableReason?: string; // Raison si indisponible
  unavailableUntil?: Date; // Date de retour en stock
}

export interface StockAlert {
  id: string;
  dishId: number;
  dishName: string;
  chefId?: string;
  type: 'low_stock' | 'out_of_stock' | 'back_in_stock';
  message: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventorySubject = new BehaviorSubject<DishInventory[]>([]);
  public inventory$ = this.inventorySubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadInventory();
    this.checkDailyRestock();
  }

  private loadInventory(): void {
    if (this.isBrowser) {
      const invJson = localStorage.getItem('dishInventory');
      const inventory = invJson ? JSON.parse(invJson) : [];
      this.inventorySubject.next(inventory);
    }
  }

  private saveInventory(inventory: DishInventory[]): void {
    if (this.isBrowser) {
      localStorage.setItem('dishInventory', JSON.stringify(inventory));
      this.inventorySubject.next(inventory);
    }
  }

  // Vérifier et réapprovisionner automatiquement chaque jour
  private checkDailyRestock(): void {
    if (!this.isBrowser) return;

    const inventory = this.getAllInventory();
    const today = new Date().setHours(0, 0, 0, 0);
    let updated = false;

    inventory.forEach(item => {
      const lastRestock = new Date(item.lastRestocked).setHours(0, 0, 0, 0);
      
      // Si c'est un nouveau jour et autoRestock activé
      if (item.autoRestock && lastRestock < today) {
        if (item.dailyLimit) {
          item.currentStock = item.dailyLimit;
        }
        item.lastRestocked = new Date();
        item.available = true;
        updated = true;
      }
    });

    if (updated) {
      this.saveInventory(inventory);
    }
  }

  // Initialiser l'inventaire pour un plat
  initializeDishInventory(
    dishId: number,
    chefId?: string,
    dailyLimit?: number
  ): void {
    const inventory = this.getAllInventory();
    
    // Vérifier si déjà initialisé
    if (inventory.find(i => i.dishId === dishId)) {
      return;
    }

    const newInventory: DishInventory = {
      dishId,
      chefId,
      available: true,
      dailyLimit,
      currentStock: dailyLimit || 999, // Par défaut illimité
      lastRestocked: new Date(),
      autoRestock: true
    };

    inventory.push(newInventory);
    this.saveInventory(inventory);
  }

  // Vérifier la disponibilité d'un plat
  isDishAvailable(dishId: number): Observable<{
    available: boolean;
    stock: number;
    message?: string;
  }> {
    return new Observable(observer => {
      const inventory = this.getAllInventory();
      const dishInventory = inventory.find(i => i.dishId === dishId);

      if (!dishInventory) {
        // Pas d'inventaire = disponible par défaut
        observer.next({ available: true, stock: 999 });
        observer.complete();
        return;
      }

      if (!dishInventory.available) {
        observer.next({
          available: false,
          stock: 0,
          message: dishInventory.unavailableReason || 'Temporairement indisponible'
        });
        observer.complete();
        return;
      }

      if (dishInventory.currentStock <= 0) {
        observer.next({
          available: false,
          stock: 0,
          message: 'Plus en stock aujourd\'hui'
        });
        observer.complete();
        return;
      }

      observer.next({
        available: true,
        stock: dishInventory.currentStock
      });
      observer.complete();
    });
  }

  // Réduire le stock après une commande
  decrementStock(dishId: number, quantity: number = 1): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const inventory = this.getAllInventory();
      const dishInventory = inventory.find(i => i.dishId === dishId);

      if (!dishInventory) {
        observer.next({ 
          success: true, 
          message: 'Pas de gestion de stock pour ce plat' 
        });
        observer.complete();
        return;
      }

      if (dishInventory.currentStock < quantity) {
        observer.next({ 
          success: false, 
          message: 'Stock insuffisant' 
        });
        observer.complete();
        return;
      }

      dishInventory.currentStock -= quantity;

      // Créer une alerte si stock faible
      if (dishInventory.dailyLimit && dishInventory.currentStock <= dishInventory.dailyLimit * 0.2) {
        this.createStockAlert(dishInventory, 'low_stock');
      }

      // Créer une alerte si rupture de stock
      if (dishInventory.currentStock <= 0) {
        dishInventory.available = false;
        this.createStockAlert(dishInventory, 'out_of_stock');
      }

      this.saveInventory(inventory);

      observer.next({ 
        success: true, 
        message: 'Stock mis à jour' 
      });
      observer.complete();
    });
  }

  // Mettre à jour la disponibilité d'un plat (chef)
  updateDishAvailability(
    dishId: number,
    available: boolean,
    reason?: string,
    unavailableUntil?: Date
  ): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const inventory = this.getAllInventory();
      const dishInventory = inventory.find(i => i.dishId === dishId);

      if (!dishInventory) {
        // Créer si n'existe pas
        const newInventory: DishInventory = {
          dishId,
          available,
          currentStock: 0,
          lastRestocked: new Date(),
          autoRestock: false,
          unavailableReason: reason,
          unavailableUntil
        };
        inventory.push(newInventory);
      } else {
        dishInventory.available = available;
        dishInventory.unavailableReason = reason;
        dishInventory.unavailableUntil = unavailableUntil;
      }

      this.saveInventory(inventory);

      observer.next({ 
        success: true, 
        message: available ? 'Plat disponible' : 'Plat indisponible' 
      });
      observer.complete();
    });
  }

  // Mettre à jour le stock quotidien (chef)
  updateDailyStock(
    dishId: number,
    dailyLimit: number,
    currentStock?: number
  ): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const inventory = this.getAllInventory();
      const dishInventory = inventory.find(i => i.dishId === dishId);

      if (!dishInventory) {
        observer.next({ 
          success: false, 
          message: 'Inventaire non trouvé' 
        });
        observer.complete();
        return;
      }

      dishInventory.dailyLimit = dailyLimit;
      dishInventory.currentStock = currentStock !== undefined ? currentStock : dailyLimit;
      dishInventory.available = dishInventory.currentStock > 0;
      dishInventory.lastRestocked = new Date();

      this.saveInventory(inventory);

      observer.next({ 
        success: true, 
        message: 'Stock mis à jour avec succès' 
      });
      observer.complete();
    });
  }

  // Réapprovisionner manuellement
  restockDish(dishId: number, quantity: number): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const inventory = this.getAllInventory();
      const dishInventory = inventory.find(i => i.dishId === dishId);

      if (!dishInventory) {
        observer.next({ 
          success: false, 
          message: 'Inventaire non trouvé' 
        });
        observer.complete();
        return;
      }

      dishInventory.currentStock = quantity;
      dishInventory.available = quantity > 0;
      dishInventory.lastRestocked = new Date();

      // Alerte retour en stock
      if (quantity > 0 && !dishInventory.available) {
        this.createStockAlert(dishInventory, 'back_in_stock');
      }

      this.saveInventory(inventory);

      observer.next({ 
        success: true, 
        message: 'Plat réapprovisionné avec succès' 
      });
      observer.complete();
    });
  }

  // Récupérer l'inventaire d'un chef
  getChefInventory(chefId: string): DishInventory[] {
    return this.getAllInventory().filter(i => i.chefId === chefId);
  }

  // Récupérer les plats avec stock faible
  getLowStockDishes(): DishInventory[] {
    return this.getAllInventory().filter(i => 
      i.dailyLimit && 
      i.currentStock > 0 && 
      i.currentStock <= i.dailyLimit * 0.2
    );
  }

  // Récupérer les plats en rupture de stock
  getOutOfStockDishes(): DishInventory[] {
    return this.getAllInventory().filter(i => 
      i.currentStock <= 0 || !i.available
    );
  }

  // Créer une alerte de stock
  private createStockAlert(inventory: DishInventory, type: 'low_stock' | 'out_of_stock' | 'back_in_stock'): void {
    const messages = {
      'low_stock': `Stock faible: ${inventory.currentStock} restant(s)`,
      'out_of_stock': 'Rupture de stock',
      'back_in_stock': 'De nouveau en stock'
    };

    const alert: StockAlert = {
      id: this.generateId(),
      dishId: inventory.dishId,
      dishName: '', // À remplir avec le nom du plat
      chefId: inventory.chefId,
      type,
      message: messages[type],
      createdAt: new Date(),
      read: false
    };

    // Sauvegarder l'alerte
    const alerts = this.getAllStockAlerts();
    alerts.unshift(alert);
    if (this.isBrowser) {
      localStorage.setItem('stockAlerts', JSON.stringify(alerts));
    }
  }

  // Récupérer les alertes de stock
  getStockAlerts(chefId?: string): StockAlert[] {
    const alerts = this.getAllStockAlerts();
    if (chefId) {
      return alerts.filter(a => a.chefId === chefId);
    }
    return alerts;
  }

  private getAllInventory(): DishInventory[] {
    if (!this.isBrowser) return [];
    
    const invJson = localStorage.getItem('dishInventory');
    return invJson ? JSON.parse(invJson) : [];
  }

  private getAllStockAlerts(): StockAlert[] {
    if (!this.isBrowser) return [];
    
    const alertsJson = localStorage.getItem('stockAlerts');
    return alertsJson ? JSON.parse(alertsJson) : [];
  }

  private generateId(): string {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}