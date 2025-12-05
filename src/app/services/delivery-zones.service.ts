// src/app/services/delivery-zones.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DeliveryZone {
  id: string;
  name: string; // Ex: "Cocody", "Marcory"
  communes: string[]; // Liste des communes
  deliveryFee: number;
  estimatedTime: string; // Ex: "30-45 min"
  active: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  radius?: number; // Rayon en km
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryZonesService {
  private zonesSubject = new BehaviorSubject<DeliveryZone[]>([]);
  public zones$ = this.zonesSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeDefaultZones();
    this.loadZones();
  }

  private initializeDefaultZones(): void {
    const existingZones = this.getAllZones();
    
    if (existingZones.length === 0) {
      const defaultZones: DeliveryZone[] = [
        {
          id: this.generateId(),
          name: 'Cocody',
          communes: ['Cocody', 'II Plateaux', 'Riviera', 'Angré', 'Ambassades'],
          deliveryFee: 500,
          estimatedTime: '30-45 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Plateau',
          communes: ['Plateau', 'Centre-ville'],
          deliveryFee: 500,
          estimatedTime: '25-35 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Marcory',
          communes: ['Marcory', 'Zone 4', 'Remblais'],
          deliveryFee: 700,
          estimatedTime: '35-50 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Yopougon',
          communes: ['Yopougon', 'Niangon', 'Attécoubé'],
          deliveryFee: 800,
          estimatedTime: '40-55 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Abobo',
          communes: ['Abobo', 'Anyama'],
          deliveryFee: 1000,
          estimatedTime: '45-60 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Koumassi',
          communes: ['Koumassi', 'Port-Bouët'],
          deliveryFee: 800,
          estimatedTime: '40-55 min',
          active: true
        },
        {
          id: this.generateId(),
          name: 'Treichville',
          communes: ['Treichville', 'Vridi'],
          deliveryFee: 600,
          estimatedTime: '30-40 min',
          active: true
        }
      ];

      this.saveZones(defaultZones);
    }
  }

  private loadZones(): void {
    if (this.isBrowser) {
      const zonesJson = localStorage.getItem('deliveryZones');
      const zones = zonesJson ? JSON.parse(zonesJson) : [];
      this.zonesSubject.next(zones);
    }
  }

  private saveZones(zones: DeliveryZone[]): void {
    if (this.isBrowser) {
      localStorage.setItem('deliveryZones', JSON.stringify(zones));
      this.zonesSubject.next(zones);
    }
  }

  // Récupérer toutes les zones actives
  getActiveZones(): Observable<DeliveryZone[]> {
    return new Observable(observer => {
      const zones = this.getAllZones().filter(z => z.active);
      observer.next(zones);
      observer.complete();
    });
  }

  // Vérifier si une adresse est dans une zone de livraison
  checkDeliveryAvailability(address: string): Observable<{
    available: boolean;
    zone?: DeliveryZone;
    message: string;
  }> {
    return new Observable(observer => {
      const zones = this.getAllZones().filter(z => z.active);
      const addressLower = address.toLowerCase();

      // Chercher une correspondance
      const matchingZone = zones.find(zone => 
        zone.communes.some(commune => 
          addressLower.includes(commune.toLowerCase())
        )
      );

      if (matchingZone) {
        observer.next({
          available: true,
          zone: matchingZone,
          message: `Livraison disponible à ${matchingZone.name} (${matchingZone.estimatedTime})`
        });
      } else {
        observer.next({
          available: false,
          message: 'Désolé, nous ne livrons pas encore dans cette zone'
        });
      }

      observer.complete();
    });
  }

  // Obtenir les frais de livraison pour une zone
  getDeliveryFee(address: string): number {
    const addressLower = address.toLowerCase();
    const zones = this.getAllZones().filter(z => z.active);

    const matchingZone = zones.find(zone => 
      zone.communes.some(commune => 
        addressLower.includes(commune.toLowerCase())
      )
    );

    return matchingZone ? matchingZone.deliveryFee : 500; // Par défaut
  }

  // Créer une zone (admin)
  createZone(zone: Omit<DeliveryZone, 'id'>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const zones = this.getAllZones();
      
      const newZone: DeliveryZone = {
        ...zone,
        id: this.generateId()
      };

      zones.push(newZone);
      this.saveZones(zones);

      observer.next({ 
        success: true, 
        message: 'Zone de livraison créée avec succès' 
      });
      observer.complete();
    });
  }

  // Mettre à jour une zone
  updateZone(zoneId: string, updates: Partial<DeliveryZone>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const zones = this.getAllZones();
      const zoneIndex = zones.findIndex(z => z.id === zoneId);

      if (zoneIndex === -1) {
        observer.next({ 
          success: false, 
          message: 'Zone introuvable' 
        });
        observer.complete();
        return;
      }

      zones[zoneIndex] = { ...zones[zoneIndex], ...updates };
      this.saveZones(zones);

      observer.next({ 
        success: true, 
        message: 'Zone mise à jour avec succès' 
      });
      observer.complete();
    });
  }

  // Désactiver une zone
  deactivateZone(zoneId: string): void {
    this.updateZone(zoneId, { active: false }).subscribe();
  }

  // Activer une zone
  activateZone(zoneId: string): void {
    this.updateZone(zoneId, { active: true }).subscribe();
  }

  // Supprimer une zone
  deleteZone(zoneId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const zones = this.getAllZones();
      const filtered = zones.filter(z => z.id !== zoneId);

      if (filtered.length === zones.length) {
        observer.next({ 
          success: false, 
          message: 'Zone introuvable' 
        });
      } else {
        this.saveZones(filtered);
        observer.next({ 
          success: true, 
          message: 'Zone supprimée avec succès' 
        });
      }

      observer.complete();
    });
  }

  // Rechercher des zones par nom ou commune
  searchZones(query: string): DeliveryZone[] {
    const queryLower = query.toLowerCase();
    return this.getAllZones().filter(zone =>
      zone.name.toLowerCase().includes(queryLower) ||
      zone.communes.some(c => c.toLowerCase().includes(queryLower))
    );
  }

  private getAllZones(): DeliveryZone[] {
    if (!this.isBrowser) return [];
    
    const zonesJson = localStorage.getItem('deliveryZones');
    return zonesJson ? JSON.parse(zonesJson) : [];
  }

  private generateId(): string {
    return 'zone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}