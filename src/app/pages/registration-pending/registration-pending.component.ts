// src/app/pages/registration-pending/registration-pending.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-registration-pending',
  templateUrl: './registration-pending.component.html',
  styleUrls: ['./registration-pending.component.scss']
})
export class RegistrationPendingComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // Si l'utilisateur est approuvé, rediriger vers son dashboard
      if (user?.status === 'approved') {
        if (user.role === 'chef') {
          this.router.navigate(['/chef/dashboard']);
        } else if (user.role === 'livreur') {
          this.router.navigate(['/livreur/dashboard']);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}