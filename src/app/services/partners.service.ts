// src/app/services/partners.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PartnerApplication {
  id: string;
  partnerType: 'chef' | 'delivery' | 'restaurant';
  name: string;
  email: string;
  phone: string;
  address: string;
  experience?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PartnersService {
  private applicationsSubject = new BehaviorSubject<PartnerApplication[]>([]);
  public applications$ = this.applicationsSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadApplications();
  }

  // Charger toutes les candidatures
  private loadApplications(): void {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('partner_applications');
    if (saved) {
      try {
        const applications = JSON.parse(saved);
        applications.forEach((app: any) => {
          app.createdAt = new Date(app.createdAt);
          app.updatedAt = new Date(app.updatedAt);
        });
        this.applicationsSubject.next(applications);
      } catch (e) {
        console.error('Erreur chargement:', e);
      }
    }
  }

  // Sauvegarder dans localStorage
  private saveApplications(applications: PartnerApplication[]): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem('partner_applications', JSON.stringify(applications));
      this.applicationsSubject.next(applications);
    } catch (e) {
      console.error('Erreur sauvegarde:', e);
    }
  }

  // Soumettre une nouvelle candidature
  submitApplication(data: Omit<PartnerApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.isBrowser) {
        observer.next({ success: false, message: 'Erreur serveur' });
        observer.complete();
        return;
      }

      const applications = this.applicationsSubject.value;

      const emailExists = applications.some(app => app.email === data.email);
      if (emailExists) {
        observer.next({ 
          success: false, 
          message: 'Une candidature avec cet email existe déjà' 
        });
        observer.complete();
        return;
      }

      const newApplication: PartnerApplication = {
        ...data,
        id: this.generateId(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      applications.push(newApplication);
      this.saveApplications(applications);

      observer.next({ 
        success: true, 
        message: 'Candidature envoyée avec succès' 
      });
      observer.complete();
    });
  }

  // Obtenir toutes les candidatures
  getAllApplications(): Observable<PartnerApplication[]> {
    return this.applications$;
  }

  // Obtenir les candidatures par statut
  getApplicationsByStatus(status: 'pending' | 'approved' | 'rejected'): Observable<PartnerApplication[]> {
    return new Observable(observer => {
      this.applications$.subscribe(apps => {
        observer.next(apps.filter(app => app.status === status));
      });
    });
  }

  // Approuver une candidature
  approveApplication(id: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const applications = this.applicationsSubject.value;
      const index = applications.findIndex(app => app.id === id);

      if (index === -1) {
        observer.next({ success: false, message: 'Candidature introuvable' });
        observer.complete();
        return;
      }

      applications[index].status = 'approved';
      applications[index].updatedAt = new Date();
      this.saveApplications(applications);

      observer.next({ 
        success: true, 
        message: 'Candidature approuvée' 
      });
      observer.complete();
    });
  }

  // Rejeter une candidature
  rejectApplication(id: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const applications = this.applicationsSubject.value;
      const index = applications.findIndex(app => app.id === id);

      if (index === -1) {
        observer.next({ success: false, message: 'Candidature introuvable' });
        observer.complete();
        return;
      }

      applications[index].status = 'rejected';
      applications[index].updatedAt = new Date();
      this.saveApplications(applications);

      observer.next({ 
        success: true, 
        message: 'Candidature rejetée' 
      });
      observer.complete();
    });
  }

  // Supprimer une candidature
  deleteApplication(id: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const applications = this.applicationsSubject.value;
      const filtered = applications.filter(app => app.id !== id);

      if (filtered.length === applications.length) {
        observer.next({ success: false, message: 'Candidature introuvable' });
        observer.complete();
        return;
      }

      this.saveApplications(filtered);
      observer.next({ 
        success: true, 
        message: 'Candidature supprimée' 
      });
      observer.complete();
    });
  }

  // Obtenir les statistiques
  getStatistics(): Observable<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: { chef: number; delivery: number; restaurant: number; }
  }> {
    return new Observable(observer => {
      this.applications$.subscribe(apps => {
        observer.next({
          total: apps.length,
          pending: apps.filter(a => a.status === 'pending').length,
          approved: apps.filter(a => a.status === 'approved').length,
          rejected: apps.filter(a => a.status === 'rejected').length,
          byType: {
            chef: apps.filter(a => a.partnerType === 'chef').length,
            delivery: apps.filter(a => a.partnerType === 'delivery').length,
            restaurant: apps.filter(a => a.partnerType === 'restaurant').length
          }
        });
      });
    });
  }

  private generateId(): string {
    return 'app_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}