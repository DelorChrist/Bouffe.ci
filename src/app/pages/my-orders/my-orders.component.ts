// src/app/pages/my-orders/my-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdersService, Order } from '../../services/orders.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  currentUser: User | null = null;
  isLoading = true;
  selectedFilter: 'all' | 'active' | 'delivered' | 'cancelled' = 'all';

  constructor(
    private ordersService: OrdersService,
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
      this.loadOrders();
    });
  }

  loadOrders(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.ordersService.getUserOrders(this.currentUser.id).subscribe(orders => {
      this.orders = orders;
      this.filterOrders();
      this.isLoading = false;
    });
  }

  filterOrders(): void {
    switch(this.selectedFilter) {
      case 'all':
        this.filteredOrders = this.orders;
        break;
      case 'active':
        this.filteredOrders = this.orders.filter(o => 
          ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(o.status)
        );
        break;
      case 'delivered':
        this.filteredOrders = this.orders.filter(o => o.status === 'delivered');
        break;
      case 'cancelled':
        this.filteredOrders = this.orders.filter(o => o.status === 'cancelled');
        break;
    }
  }

  selectFilter(filter: 'all' | 'active' | 'delivered' | 'cancelled'): void {
    this.selectedFilter = filter;
    this.filterOrders();
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusMessage(status: string): string {
    return this.ordersService.getStatusMessage(status as any);
  }

  getStatusColor(status: string): string {
    return this.ordersService.getStatusColor(status as any);
  }

  getStatusIcon(status: string): string {
    return this.ordersService.getStatusIcon(status as any);
  }

  getProgressPercentage(status: string): number {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    const index = statusOrder.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / statusOrder.length) * 100;
  }

  canCancelOrder(order: Order): boolean {
    return ['pending', 'confirmed'].includes(order.status);
  }

  cancelOrder(orderId: string, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      this.ordersService.cancelOrder(orderId, 'Annulée par le client').subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders();
          }
        }
      });
    }
  }

  reorder(order: Order, event: Event): void {
    event.stopPropagation();
    // TODO: Implémenter la fonction de recommande
    alert('Fonctionnalité de recommande à venir');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}