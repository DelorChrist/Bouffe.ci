// src/app/services/orders.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from './cart.service';
import { User } from './auth.service';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'mobile' | 'card' | 'cash';
  status: OrderStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryTime?: Date;
  livreurId?: string;
  chefId?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    message?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadOrders();
  }

  private loadOrders(): void {
    if (this.isBrowser) {
      const ordersJson = localStorage.getItem('orders');
      const orders = ordersJson ? JSON.parse(ordersJson) : [];
      this.ordersSubject.next(orders);
    }
  }

  private saveOrders(orders: Order[]): void {
    if (this.isBrowser) {
      localStorage.setItem('orders', JSON.stringify(orders));
      this.ordersSubject.next(orders);
    }
  }

  createOrder(orderData: {
    user: User;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    paymentMethod: 'mobile' | 'card' | 'cash';
    notes?: string;
  }): Observable<{ success: boolean; message: string; order?: Order }> {
    return new Observable(observer => {
      const orderNumber = 'BC' + Date.now().toString().slice(-8);
      
      const newOrder: Order = {
        id: this.generateId(),
        orderNumber: orderNumber,
        userId: orderData.user.id,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        items: orderData.items,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.subtotal + orderData.deliveryFee,
        paymentMethod: orderData.paymentMethod,
        status: 'pending',
        notes: orderData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          message: 'Commande créée'
        }]
      };

      const orders = this.getAllOrders();
      orders.push(newOrder);
      this.saveOrders(orders);

      observer.next({
        success: true,
        message: 'Commande créée avec succès',
        order: newOrder
      });
      observer.complete();
    });
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return new Observable(observer => {
      const orders = this.getAllOrders()
        .filter(order => order.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      observer.next(orders);
      observer.complete();
    });
  }

  getOrderById(orderId: string): Order | undefined {
    return this.getAllOrders().find(order => order.id === orderId);
  }

  getOrderByNumber(orderNumber: string): Order | undefined {
    return this.getAllOrders().find(order => order.orderNumber === orderNumber);
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, message?: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const orders = this.getAllOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        observer.next({ success: false, message: 'Commande introuvable' });
        observer.complete();
        return;
      }

      orders[orderIndex].status = newStatus;
      orders[orderIndex].updatedAt = new Date();
      orders[orderIndex].statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        message: message || this.getStatusMessage(newStatus)
      });

      if (newStatus === 'delivered') {
        orders[orderIndex].deliveryTime = new Date();
      }

      this.saveOrders(orders);

      observer.next({ success: true, message: 'Statut mis à jour avec succès' });
      observer.complete();
    });
  }

  assignLivreur(orderId: string, livreurId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const orders = this.getAllOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        observer.next({ success: false, message: 'Commande introuvable' });
        observer.complete();
        return;
      }

      orders[orderIndex].livreurId = livreurId;
      orders[orderIndex].updatedAt = new Date();
      
      this.saveOrders(orders);

      observer.next({ success: true, message: 'Livreur assigné avec succès' });
      observer.complete();
    });
  }

  assignChef(orderId: string, chefId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const orders = this.getAllOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);

      if (orderIndex === -1) {
        observer.next({ success: false, message: 'Commande introuvable' });
        observer.complete();
        return;
      }

      orders[orderIndex].chefId = chefId;
      orders[orderIndex].updatedAt = new Date();
      
      this.saveOrders(orders);

      observer.next({ success: true, message: 'Chef assigné avec succès' });
      observer.complete();
    });
  }

  cancelOrder(orderId: string, reason?: string): Observable<{ success: boolean; message: string }> {
    return this.updateOrderStatus(orderId, 'cancelled', reason || 'Commande annulée');
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.getAllOrders().filter(order => order.status === status);
  }

  getAllOrders(): Order[] {
    if (!this.isBrowser) return [];
    
    const ordersJson = localStorage.getItem('orders');
    return ordersJson ? JSON.parse(ordersJson) : [];
  }

  getStatusMessage(status: OrderStatus): string {
    const messages: Record<OrderStatus, string> = {
      'pending': 'Commande en attente de confirmation',
      'confirmed': 'Commande confirmée',
      'preparing': 'Commande en préparation',
      'ready': 'Commande prête',
      'delivering': 'Commande en cours de livraison',
      'delivered': 'Commande livrée',
      'cancelled': 'Commande annulée'
    };
    return messages[status];
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      'pending': '#FFA500',
      'confirmed': '#2196F3',
      'preparing': '#9C27B0',
      'ready': '#4CAF50',
      'delivering': '#FF9800',
      'delivered': '#4CAF50',
      'cancelled': '#F44336'
    };
    return colors[status];
  }

  getStatusIcon(status: OrderStatus): string {
    const icons: Record<OrderStatus, string> = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '📦',
      'delivering': '🚚',
      'delivered': '✓',
      'cancelled': '❌'
    };
    return icons[status];
  }

  private generateId(): string {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}