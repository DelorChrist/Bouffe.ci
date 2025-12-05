// src/app/pages/role-register/role-register.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, RegisterData, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-role-register',
  templateUrl: './role-register.component.html',
  styleUrls: ['./role-register.component.scss']
})
export class RoleRegisterComponent {
  step: 'role' | 'form' = 'role';
  selectedRole: UserRole = 'user';

  formData: RegisterData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    specialties: [],
    experience: '',
    vehicleType: '',
    documents: {}
  };

  // Chef form
  specialtyInput: string = '';

  // Livreur form
  vehicleTypes = ['Moto', 'Scooter', 'Voiture', 'Vélo'];
  uploadedDocs = {
    idCardFront: false,
    idCardBack: false,
    drivingLicenseFront: false,
    drivingLicenseBack: false
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: UserRole): void {
    this.selectedRole = role;
    this.formData.role = role;
    this.step = 'form';
  }

  backToRoleSelection(): void {
    this.step = 'role';
    this.errorMessage = '';
  }

  addSpecialty(): void {
    if (this.specialtyInput.trim() && this.formData.specialties) {
      this.formData.specialties.push(this.specialtyInput.trim());
      this.specialtyInput = '';
    }
  }

  removeSpecialty(index: number): void {
    if (this.formData.specialties) {
      this.formData.specialties.splice(index, 1);
    }
  }

  onFileSelect(event: Event, docType: keyof typeof this.uploadedDocs): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64 = e.target?.result as string;
        
        if (!this.formData.documents) {
          this.formData.documents = {};
        }

        switch(docType) {
          case 'idCardFront':
            this.formData.documents.idCardFront = base64;
            break;
          case 'idCardBack':
            this.formData.documents.idCardBack = base64;
            break;
          case 'drivingLicenseFront':
            this.formData.documents.drivingLicenseFront = base64;
            break;
          case 'drivingLicenseBack':
            this.formData.documents.drivingLicenseBack = base64;
            break;
        }

        this.uploadedDocs[docType] = true;
      };

      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validation de base
    if (!this.formData.name || !this.formData.email || !this.formData.phone || 
        !this.formData.password || !this.formData.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Email invalide';
      return;
    }

    // Validation téléphone
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.formData.phone)) {
      this.errorMessage = 'Numéro de téléphone invalide';
      return;
    }

    // Validations spécifiques selon le rôle
    if (this.selectedRole === 'chef') {
      if (!this.formData.specialties || this.formData.specialties.length === 0) {
        this.errorMessage = 'Veuillez ajouter au moins une spécialité';
        return;
      }
      if (!this.formData.experience || this.formData.experience.trim() === '') {
        this.errorMessage = 'Veuillez décrire votre expérience';
        return;
      }
    }

    if (this.selectedRole === 'livreur') {
      if (!this.formData.vehicleType) {
        this.errorMessage = 'Veuillez sélectionner un type de véhicule';
        return;
      }
      if (!this.uploadedDocs.idCardFront || !this.uploadedDocs.idCardBack ||
          !this.uploadedDocs.drivingLicenseFront || !this.uploadedDocs.drivingLicenseBack) {
        this.errorMessage = 'Veuillez télécharger tous les documents requis';
        return;
      }
    }

    this.isLoading = true;

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          if (this.selectedRole === 'user') {
            this.router.navigate(['/']);
          } else {
            // Rediriger vers une page de confirmation pour chef/livreur
            this.router.navigate(['/registration-pending']);
          }
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        console.error('Erreur d\'inscription:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}