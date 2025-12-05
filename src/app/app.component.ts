// src/app/app.component.ts
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Les meilleurs Dabali Ivoiriens';
  currentRoute: string = '';

  constructor(private router: Router) {
    // Suivre les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
    });
  }

  isDashboardRoute(): boolean {
    return this.currentRoute.includes('/admin/') || 
           this.currentRoute.includes('/chef/') || 
           this.currentRoute.includes('/livreur/');
  }
}