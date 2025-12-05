// src/app/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  
  // Formulaire d'informations
  profileForm = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  // Formulaire de mot de passe
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // États
  isEditingProfile = false;
  isEditingPassword = false;
  isLoadingProfile = false;
  isLoadingPassword = false;
  profileMessage = '';
  passwordMessage = '';
  profileMessageType: 'success' | 'error' = 'success';
  passwordMessageType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      this.currentUser = user;
      this.loadProfileData();
    });
  }

  loadProfileData(): void {
    if (this.currentUser) {
      this.profileForm = {
        name: this.currentUser.name,
        email: this.currentUser.email,
        phone: this.currentUser.phone,
        address: this.currentUser.address || ''
      };
    }
  }

  toggleEditProfile(): void {
    if (this.isEditingProfile) {
      this.loadProfileData(); // Annuler les modifications
    }
    this.isEditingProfile = !this.isEditingProfile;
    this.profileMessage = '';
  }

  toggleEditPassword(): void {
    if (this.isEditingPassword) {
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    }
    this.isEditingPassword = !this.isEditingPassword;
    this.passwordMessage = '';
  }

  saveProfile(): void {
    this.profileMessage = '';

    // Validation
    if (!this.profileForm.name || !this.profileForm.email || !this.profileForm.phone) {
      this.profileMessage = 'Veuillez remplir tous les champs obligatoires';
      this.profileMessageType = 'error';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileForm.email)) {
      this.profileMessage = 'Email invalide';
      this.profileMessageType = 'error';
      return;
    }

    // Validation téléphone
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.profileForm.phone)) {
      this.profileMessage = 'Numéro de téléphone invalide';
      this.profileMessageType = 'error';
      return;
    }

    this.isLoadingProfile = true;

    this.authService.updateProfile(this.profileForm).subscribe({
      next: (response) => {
        this.isLoadingProfile = false;
        if (response.success) {
          this.profileMessage = response.message;
          this.profileMessageType = 'success';
          this.isEditingProfile = false;
          setTimeout(() => {
            this.profileMessage = '';
          }, 3000);
        } else {
          this.profileMessage = response.message;
          this.profileMessageType = 'error';
        }
      },
      error: (error) => {
        this.isLoadingProfile = false;
        this.profileMessage = 'Une erreur est survenue';
        this.profileMessageType = 'error';
        console.error('Erreur:', error);
      }
    });
  }

  changePassword(): void {
    this.passwordMessage = '';

    // Validation
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || 
        !this.passwordForm.confirmPassword) {
      this.passwordMessage = 'Veuillez remplir tous les champs';
      this.passwordMessageType = 'error';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordMessage = 'Les nouveaux mots de passe ne correspondent pas';
      this.passwordMessageType = 'error';
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      this.passwordMessageType = 'error';
      return;
    }

    this.isLoadingPassword = true;

    this.authService.changePassword(
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: (response) => {
        this.isLoadingPassword = false;
        if (response.success) {
          this.passwordMessage = response.message;
          this.passwordMessageType = 'success';
          this.isEditingPassword = false;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          setTimeout(() => {
            this.passwordMessage = '';
          }, 3000);
        } else {
          this.passwordMessage = response.message;
          this.passwordMessageType = 'error';
        }
      },
      error: (error) => {
        this.isLoadingPassword = false;
        this.passwordMessage = 'Une erreur est survenue';
        this.passwordMessageType = 'error';
        console.error('Erreur:', error);
      }
    });
  }

  deleteAccount(): void {
    const confirmation = confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    );
    
    if (confirmation) {
      this.authService.deleteAccount().subscribe({
        next: (response) => {
          if (response.success) {
            alert('Votre compte a été supprimé');
            this.router.navigate(['/']);
          }
        }
      });
    }
  }
}