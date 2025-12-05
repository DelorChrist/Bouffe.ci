// src/app/services/promo-codes.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export type PromoType = 'percentage' | 'fixed' | 'free_delivery';

export interface PromoCode {
  id: string;
  code: string; // Ex: BIENVENUE10
  type: PromoType;
  value: number; // Pourcentage ou montant fixe
  description: string;
  minOrderAmount?: number; // Montant minimum de commande
  maxDiscount?: number; // Réduction maximum
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Nombre total d'utilisations
  usageCount: number;
  perUserLimit?: number; // Nombre d'utilisations par utilisateur
  active: boolean;
  categories?: string[]; // Catégories de plats concernées
  firstOrderOnly?: boolean; // Réservé aux premières commandes
  userRestrictions?: string[]; // Utilisateurs spécifiques
}

export interface PromoUsage {
  id: string;
  userId: string;
  promoId: string;
  code: string;
  orderId: string;
  discountApplied: number;
  usedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PromoCodesService {
  private promoCodesSubject = new BehaviorSubject<PromoCode[]>([]);
  public promoCodes$ = this.promoCodesSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeDefaultPromos();
    this.loadPromoCodes();
  }

  private initializeDefaultPromos(): void {
    const existingPromos = this.getAllPromoCodes();
    
    if (existingPromos.length === 0) {
      const defaultPromos: PromoCode[] = [
        {
          id: this.generateId(),
          code: 'BIENVENUE10',
          type: 'percentage',
          value: 10,
          description: '10% de réduction sur votre première commande',
          minOrderAmount: 1000,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31'),
          usageCount: 0,
          perUserLimit: 1,
          active: true,
          firstOrderOnly: true
        },
        {
          id: this.generateId(),
          code: 'LIVRAISONGRATUITE',
          type: 'free_delivery',
          value: 500,
          description: 'Livraison gratuite',
          minOrderAmount: 3000,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31'),
          usageCount: 0,
          active: true
        },
        {
          id: this.generateId(),
          code: 'WEEKEND20',
          type: 'percentage',
          value: 20,
          description: '20% de réduction les weekends',
          minOrderAmount: 2000,
          maxDiscount: 2000,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31'),
          usageCount: 0,
          active: true
        }
      ];

      this.savePromoCodes(defaultPromos);
    }
  }

  private loadPromoCodes(): void {
    if (this.isBrowser) {
      const promosJson = localStorage.getItem('promoCodes');
      const promos = promosJson ? JSON.parse(promosJson) : [];
      this.promoCodesSubject.next(promos);
    }
  }

  private savePromoCodes(promos: PromoCode[]): void {
    if (this.isBrowser) {
      localStorage.setItem('promoCodes', JSON.stringify(promos));
      this.promoCodesSubject.next(promos);
    }
  }

  // Valider un code promo
  validatePromoCode(
    code: string, 
    userId: string, 
    orderAmount: number,
    isFirstOrder: boolean = false
  ): Observable<{ 
    valid: boolean; 
    message: string; 
    promo?: PromoCode;
    discountAmount?: number;
  }> {
    return new Observable(observer => {
      const promos = this.getAllPromoCodes();
      const promo = promos.find(p => p.code.toLowerCase() === code.toLowerCase());

      // Promo n'existe pas
      if (!promo) {
        observer.next({ 
          valid: false, 
          message: 'Code promo invalide' 
        });
        observer.complete();
        return;
      }

      // Promo inactive
      if (!promo.active) {
        observer.next({ 
          valid: false, 
          message: 'Ce code promo n\'est plus actif' 
        });
        observer.complete();
        return;
      }

      // Vérifier les dates
      const now = new Date();
      if (now < new Date(promo.validFrom) || now > new Date(promo.validUntil)) {
        observer.next({ 
          valid: false, 
          message: 'Ce code promo a expiré' 
        });
        observer.complete();
        return;
      }

      // Vérifier montant minimum
      if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
        observer.next({ 
          valid: false, 
          message: `Montant minimum de ${promo.minOrderAmount} FCFA requis` 
        });
        observer.complete();
        return;
      }

      // Vérifier si réservé première commande
      if (promo.firstOrderOnly && !isFirstOrder) {
        observer.next({ 
          valid: false, 
          message: 'Ce code est réservé aux premières commandes' 
        });
        observer.complete();
        return;
      }

      // Vérifier limite d'utilisation totale
      if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        observer.next({ 
          valid: false, 
          message: 'Ce code a atteint sa limite d\'utilisation' 
        });
        observer.complete();
        return;
      }

      // Vérifier limite par utilisateur
      if (promo.perUserLimit) {
        const userUsageCount = this.getUserPromoUsageCount(userId, promo.id);
        if (userUsageCount >= promo.perUserLimit) {
          observer.next({ 
            valid: false, 
            message: 'Vous avez déjà utilisé ce code' 
          });
          observer.complete();
          return;
        }
      }

      // Calculer la réduction
      const discountAmount = this.calculateDiscount(promo, orderAmount);

      observer.next({ 
        valid: true, 
        message: 'Code promo appliqué avec succès',
        promo,
        discountAmount
      });
      observer.complete();
    });
  }

  // Calculer la réduction
  calculateDiscount(promo: PromoCode, orderAmount: number): number {
    let discount = 0;

    switch (promo.type) {
      case 'percentage':
        discount = (orderAmount * promo.value) / 100;
        if (promo.maxDiscount && discount > promo.maxDiscount) {
          discount = promo.maxDiscount;
        }
        break;
      
      case 'fixed':
        discount = promo.value;
        break;
      
      case 'free_delivery':
        discount = promo.value; // Montant de la livraison
        break;
    }

    return Math.round(discount);
  }

  // Enregistrer l'utilisation d'un code promo
  recordPromoUsage(
    userId: string, 
    promoId: string, 
    code: string,
    orderId: string,
    discountApplied: number
  ): void {
    const usage: PromoUsage = {
      id: this.generateId(),
      userId,
      promoId,
      code,
      orderId,
      discountApplied,
      usedAt: new Date()
    };

    // Enregistrer l'utilisation
    const usages = this.getAllPromoUsages();
    usages.push(usage);
    if (this.isBrowser) {
      localStorage.setItem('promoUsages', JSON.stringify(usages));
    }

    // Incrémenter le compteur d'utilisation
    const promos = this.getAllPromoCodes();
    const promo = promos.find(p => p.id === promoId);
    if (promo) {
      promo.usageCount++;
      this.savePromoCodes(promos);
    }
  }

  // Créer un code promo (admin)
  createPromoCode(promo: Omit<PromoCode, 'id' | 'usageCount'>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const promos = this.getAllPromoCodes();
      
      // Vérifier si le code existe déjà
      const existing = promos.find(p => p.code.toLowerCase() === promo.code.toLowerCase());
      if (existing) {
        observer.next({ 
          success: false, 
          message: 'Ce code promo existe déjà' 
        });
        observer.complete();
        return;
      }

      const newPromo: PromoCode = {
        ...promo,
        id: this.generateId(),
        usageCount: 0
      };

      promos.push(newPromo);
      this.savePromoCodes(promos);

      observer.next({ 
        success: true, 
        message: 'Code promo créé avec succès' 
      });
      observer.complete();
    });
  }

  // Mettre à jour un code promo
  updatePromoCode(promoId: string, updates: Partial<PromoCode>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const promos = this.getAllPromoCodes();
      const promoIndex = promos.findIndex(p => p.id === promoId);

      if (promoIndex === -1) {
        observer.next({ 
          success: false, 
          message: 'Code promo introuvable' 
        });
        observer.complete();
        return;
      }

      promos[promoIndex] = { ...promos[promoIndex], ...updates };
      this.savePromoCodes(promos);

      observer.next({ 
        success: true, 
        message: 'Code promo mis à jour' 
      });
      observer.complete();
    });
  }

  // Désactiver un code promo
  deactivatePromoCode(promoId: string): void {
    this.updatePromoCode(promoId, { active: false }).subscribe();
  }

  // Récupérer tous les codes promo actifs
  getActivePromoCodes(): PromoCode[] {
    const now = new Date();
    return this.getAllPromoCodes().filter(p => 
      p.active && 
      now >= new Date(p.validFrom) && 
      now <= new Date(p.validUntil)
    );
  }

  // Vérifier si c'est la première commande de l'utilisateur
  isFirstOrder(userId: string): boolean {
    if (!this.isBrowser) return false;
    
    const ordersJson = localStorage.getItem('orders');
    const orders = ordersJson ? JSON.parse(ordersJson) : [];
    const userOrders = orders.filter((o: any) => o.userId === userId && o.status === 'delivered');
    
    return userOrders.length === 0;
  }

  private getUserPromoUsageCount(userId: string, promoId: string): number {
    const usages = this.getAllPromoUsages();
    return usages.filter(u => u.userId === userId && u.promoId === promoId).length;
  }

  private getAllPromoCodes(): PromoCode[] {
    if (!this.isBrowser) return [];
    
    const promosJson = localStorage.getItem('promoCodes');
    return promosJson ? JSON.parse(promosJson) : [];
  }

  private getAllPromoUsages(): PromoUsage[] {
    if (!this.isBrowser) return [];
    
    const usagesJson = localStorage.getItem('promoUsages');
    return usagesJson ? JSON.parse(usagesJson) : [];
  }

  private generateId(): string {
    return 'promo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}