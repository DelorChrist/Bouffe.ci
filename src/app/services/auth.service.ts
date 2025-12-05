// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export type UserRole = 'user' | 'chef' | 'livreur' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  createdAt: Date;
  status: AccountStatus;
  profileImage?: string;
  // Pour les chefs
  specialties?: string[];
  experience?: string;
  // Pour les livreurs
  vehicleType?: string;
  documents?: {
    idCardFront?: string;
    idCardBack?: string;
    drivingLicenseFront?: string;
    drivingLicenseBack?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  
  // Pour les chefs
  specialties?: string[];
  experience?: string;
  // Pour les livreurs
  vehicleType?: string;
  documents?: {
    idCardFront?: string;
    idCardBack?: string;
    drivingLicenseFront?: string;
    drivingLicenseBack?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          this.currentUserSubject.next(JSON.parse(savedUser));
        } catch (e) {
          console.error('Erreur lors du chargement de l\'utilisateur:', e);
        }
      }

      // Créer un compte admin par défaut
      this.createDefaultAdmin();
    }
  }

  private createDefaultAdmin(): void {
    const users = this.getAllUsers();
    const adminExists = users.some(u => u.role === 'admin');
    
    if (!adminExists) {
      const admin = {
        id: 'admin_' + Date.now(),
        name: 'Administrateur',
        email: 'admin@bouffe.ci',
        phone: '+225 05 01 58 90 09',
        role: 'admin' as UserRole,
        password: 'admin123',
        createdAt: new Date(),
        status: 'approved' as AccountStatus
      };
      users.push(admin);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  get isChef(): boolean {
    return this.currentUserValue?.role === 'chef';
  }

  get isLivreur(): boolean {
    return this.currentUserValue?.role === 'livreur';
  }

  get isUser(): boolean {
    return this.currentUserValue?.role === 'user';
  }

  register(data: RegisterData): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable(observer => {
      if (data.password !== data.confirmPassword) {
        observer.next({ success: false, message: 'Les mots de passe ne correspondent pas' });
        observer.complete();
        return;
      }

      if (data.password.length < 6) {
        observer.next({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' });
        observer.complete();
        return;
      }

      if (this.isBrowser) {
        const users = this.getAllUsers();
        const emailExists = users.some(u => u.email === data.email);

        if (emailExists) {
          observer.next({ success: false, message: 'Cet email est déjà utilisé' });
          observer.complete();
          return;
        }

        // Validation spécifique pour les livreurs
        if (data.role === 'livreur') {
          if (!data.vehicleType || !data.documents?.idCardFront || !data.documents?.idCardBack ||
              !data.documents?.drivingLicenseFront || !data.documents?.drivingLicenseBack) {
            observer.next({ 
              success: false, 
              message: 'Les livreurs doivent fournir tous les documents (pièce d\'identité et permis recto/verso)' 
            });
            observer.complete();
            return;
          }
        }

        // Validation spécifique pour les chefs
        if (data.role === 'chef') {
          if (!data.specialties || data.specialties.length === 0 || !data.experience) {
            observer.next({ 
              success: false, 
              message: 'Les cuisiniers doivent renseigner leurs spécialités et leur expérience' 
            });
            observer.complete();
            return;
          }
        }

        // Déterminer le statut selon le rôle
        let status: AccountStatus = 'approved';
        if (data.role === 'chef' || data.role === 'livreur') {
          status = 'pending'; // En attente de validation admin
        }

        const newUser: User = {
          id: this.generateId(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          createdAt: new Date(),
          status: status,
          specialties: data.specialties,
          experience: data.experience,
          vehicleType: data.vehicleType,
          documents: data.documents
        };

        const userWithPassword = {
          ...newUser,
          password: data.password
        };

        users.push(userWithPassword);
        localStorage.setItem('users', JSON.stringify(users));

        // Ne connecter automatiquement que les utilisateurs normaux
        if (data.role === 'user') {
          this.setCurrentUser(newUser);
          observer.next({ 
            success: true, 
            message: 'Inscription réussie !',
            user: newUser 
          });
        } else {
          observer.next({ 
            success: true, 
            message: `Inscription réussie ! Votre compte ${data.role === 'chef' ? 'cuisinier' : 'livreur'} est en attente de validation par un administrateur.`,
            user: newUser 
          });
        }
      } else {
        observer.next({ success: false, message: 'Erreur serveur' });
      }

      observer.complete();
    });
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable(observer => {
      if (this.isBrowser) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === credentials.email);

        if (!user) {
          observer.next({ success: false, message: 'Email ou mot de passe incorrect' });
          observer.complete();
          return;
        }

        if (user.password !== credentials.password) {
          observer.next({ success: false, message: 'Email ou mot de passe incorrect' });
          observer.complete();
          return;
        }

        // Vérifier le statut du compte
        if (user.status === 'pending') {
          observer.next({ 
            success: false, 
            message: 'Votre compte est en attente de validation par un administrateur.' 
          });
          observer.complete();
          return;
        }

        if (user.status === 'rejected') {
          observer.next({ 
            success: false, 
            message: 'Votre compte a été rejeté. Veuillez contacter l\'administrateur.' 
          });
          observer.complete();
          return;
        }

        const { password, ...userWithoutPassword } = user;
        this.setCurrentUser(userWithoutPassword as User);

        // Rediriger selon le rôle
        setTimeout(() => {
          switch(user.role) {
            case 'admin':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'chef':
              this.router.navigate(['/chef/dashboard']);
              break;
            case 'livreur':
              this.router.navigate(['/livreur/dashboard']);
              break;
            default:
              this.router.navigate(['/']);
          }
        }, 100);

        observer.next({ 
          success: true, 
          message: 'Connexion réussie !',
          user: userWithoutPassword as User
        });
      } else {
        observer.next({ success: false, message: 'Erreur serveur' });
      }

      observer.complete();
    });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  updateProfile(userData: Partial<User>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.currentUserValue) {
        observer.next({ success: false, message: 'Utilisateur non connecté' });
        observer.complete();
        return;
      }

      if (this.isBrowser) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUserValue?.id);

        if (userIndex !== -1) {
          const updatedUser = {
            ...users[userIndex],
            ...userData
          };
          users[userIndex] = updatedUser;
          localStorage.setItem('users', JSON.stringify(users));

          const { password, ...userWithoutPassword } = updatedUser;
          this.setCurrentUser(userWithoutPassword as User);

          observer.next({ success: true, message: 'Profil mis à jour avec succès' });
        } else {
          observer.next({ success: false, message: 'Utilisateur introuvable' });
        }
      }

      observer.complete();
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.currentUserValue) {
        observer.next({ success: false, message: 'Utilisateur non connecté' });
        observer.complete();
        return;
      }

      if (this.isBrowser) {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === this.currentUserValue?.id);

        if (!user) {
          observer.next({ success: false, message: 'Utilisateur introuvable' });
          observer.complete();
          return;
        }

        if (user.password !== currentPassword) {
          observer.next({ success: false, message: 'Mot de passe actuel incorrect' });
          observer.complete();
          return;
        }

        const userIndex = users.findIndex(u => u.id === this.currentUserValue?.id);
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
          observer.next({ success: true, message: 'Mot de passe modifié avec succès' });
        }
      }

      observer.complete();
    });
  }

  deleteAccount(): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      if (!this.currentUserValue) {
        observer.next({ success: false, message: 'Utilisateur non connecté' });
        observer.complete();
        return;
      }

      if (this.isBrowser) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== this.currentUserValue?.id);
        
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        localStorage.removeItem('currentUser');
        
        this.currentUserSubject.next(null);
        observer.next({ success: true, message: 'Compte supprimé avec succès' });
      }

      observer.complete();
    });
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  getAllUsers(): any[] {
    if (!this.isBrowser) return [];
    
    const usersJson = localStorage.getItem('users');
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}