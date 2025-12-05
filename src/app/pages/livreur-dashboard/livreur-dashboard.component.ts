// src/app/pages/livreur-dashboard/livreur-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { OrdersService, Order } from '../../services/orders.service';

@Component({
  selector: 'app-livreur-dashboard',
  templateUrl: './livreur-dashboard.component.html',
  styleUrls: ['./livreur-dashboard.component.scss']
})
export class LivreurDashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentSection: 'overview' | 'deliveries' | 'history' = 'overview';
  
  assignedOrders: Order[] = [];
  completedOrders: Order[] = [];
  
  stats = {
    todayDeliveries: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    averageRating: 4.8
  };

  constructor(
    public authService: AuthService,
    public ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    if (!this.currentUser) return;

    // TODO: Load orders assigned to this livreur
    const allOrders = this.ordersService.getAllOrders();
    this.assignedOrders = allOrders.filter(o => 
      o.livreurId === this.currentUser?.id && 
      ['ready', 'delivering'].includes(o.status)
    );

    this.completedOrders = allOrders.filter(o => 
      o.livreurId === this.currentUser?.id && 
      o.status === 'delivered'
    );

    this.calculateStats();
  }

  calculateStats(): void {
    this.stats.totalDeliveries = this.completedOrders.length;
    this.stats.totalEarnings = this.completedOrders.length * 500; // 500 FCFA par livraison
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.stats.todayDeliveries = this.completedOrders.filter(o => 
      new Date(o.deliveryTime || 0) >= today
    ).length;
  }

  changeSection(section: 'overview' | 'deliveries' | 'history'): void {
    this.currentSection = section;
  }

  startDelivery(orderId: string): void {
    this.ordersService.updateOrderStatus(orderId, 'delivering', 'Livraison en cours').subscribe({
      next: (response) => {
        if (response.success) {
          this.loadData();
        }
      }
    });
  }

  completeDelivery(orderId: string): void {
    if (!confirm('Confirmer la livraison ?')) return;

    this.ordersService.updateOrderStatus(orderId, 'delivered', 'Livré avec succès').subscribe({
      next: (response) => {
        if (response.success) {
          this.loadData();
          alert('Livraison confirmée ! +500 FCFA');
        }
      }
    });
  }

  getStatusMessage(status: string): string {
    return this.ordersService.getStatusMessage(status as any);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR');
  }
}