// src/app/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  formData: RegisterData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: "user"
  };

  isLoading = false;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
      return;
    }

    // Récupérer l'URL de retour
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Validation
    if (!this.formData.name || !this.formData.email || !this.formData.phone || 
        !this.formData.password || !this.formData.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs';
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

    // Validation du téléphone (format simple)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(this.formData.phone)) {
      this.errorMessage = 'Numéro de téléphone invalide';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Rediriger vers la page demandée ou l'accueil
          this.router.navigate([this.returnUrl]);
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
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }
}