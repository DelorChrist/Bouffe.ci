// src/app/services/notifications.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'delivery' | 'system' | 'promo';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadNotifications();
  }

  private loadNotifications(): void {
    if (this.isBrowser) {
      const notifJson = localStorage.getItem('notifications');
      const notifications = notifJson ? JSON.parse(notifJson) : [];
      this.notificationsSubject.next(notifications);
    }
  }

  private saveNotifications(notifications: Notification[]): void {
    if (this.isBrowser) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      this.notificationsSubject.next(notifications);
    }
  }

  // Créer une notification
  create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
    const newNotif: Notification = {
      ...notification,
      id: this.generateId(),
      read: false,
      createdAt: new Date()
    };

    const notifications = this.getAllNotifications();
    notifications.unshift(newNotif); // Ajouter au début
    this.saveNotifications(notifications);

    // Afficher notification toast
    this.showToast(newNotif);

    // Notification navigateur si permission accordée
    this.showBrowserNotification(newNotif);
  }

  // Notifications pour changement de statut commande
  notifyOrderStatusChange(
    userId: string,
    orderNumber: string,
    newStatus: string,
    statusMessage: string
  ): void {
    const icons: Record<string, string> = {
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '📦',
      'delivering': '🚚',
      'delivered': '✓'
    };

    this.create({
      userId,
      type: 'order',
      title: `Commande #${orderNumber}`,
      message: statusMessage,
      icon: icons[newStatus] || '📦',
      link: `/my-orders`,
      data: { orderNumber, status: newStatus }
    });
  }

  // Notification nouvelle commande pour chef
  notifyNewOrderForChef(chefId: string, orderNumber: string, itemsCount: number): void {
    this.create({
      userId: chefId,
      type: 'order',
      title: 'Nouvelle commande !',
      message: `Commande #${orderNumber} - ${itemsCount} plat(s) à préparer`,
      icon: '🔔',
      link: `/chef/dashboard`,
      data: { orderNumber }
    });
  }

  // Notification livraison assignée pour livreur
  notifyDeliveryAssigned(livreurId: string, orderNumber: string, address: string): void {
    this.create({
      userId: livreurId,
      type: 'delivery',
      title: 'Nouvelle livraison !',
      message: `Livraison #${orderNumber} assignée - ${address}`,
      icon: '🏍️',
      link: `/livreur/dashboard`,
      data: { orderNumber }
    });
  }

  // Notification code promo
  notifyPromoCode(userId: string, code: string, discount: number): void {
    this.create({
      userId,
      type: 'promo',
      title: '🎁 Code promo disponible !',
      message: `Utilisez le code ${code} pour ${discount}% de réduction`,
      icon: '🎉',
      link: '/menu',
      data: { code, discount }
    });
  }

  // Notification plat validé pour chef
  notifyDishApproved(chefId: string, dishName: string): void {
    this.create({
      userId: chefId,
      type: 'system',
      title: 'Plat approuvé !',
      message: `Votre plat "${dishName}" a été approuvé et ajouté au menu`,
      icon: '✅',
      link: '/chef/dashboard',
      data: { dishName }
    });
  }

  // Notification plat rejeté pour chef
  notifyDishRejected(chefId: string, dishName: string, reason: string): void {
    this.create({
      userId: chefId,
      type: 'system',
      title: 'Plat rejeté',
      message: `Votre plat "${dishName}" a été rejeté. Raison: ${reason}`,
      icon: '❌',
      link: '/chef/dashboard',
      data: { dishName, reason }
    });
  }

  // Récupérer les notifications d'un utilisateur
  getUserNotifications(userId: string): Observable<Notification[]> {
    return new Observable(observer => {
      const allNotifications = this.getAllNotifications();
      const userNotifications = allNotifications.filter(n => n.userId === userId);
      observer.next(userNotifications);
      observer.complete();
    });
  }

  // Compter les non lues
  getUnreadCount(userId: string): number {
    const notifications = this.getAllNotifications().filter(
      n => n.userId === userId && !n.read
    );
    return notifications.length;
  }

  // Marquer comme lue
  markAsRead(notificationId: string): void {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
  }

  // Marquer toutes comme lues
  markAllAsRead(userId: string): void {
    const notifications = this.getAllNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    this.saveNotifications(notifications);
  }

  // Supprimer une notification
  delete(notificationId: string): void {
    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    this.saveNotifications(filtered);
  }

  // Supprimer toutes les notifications d'un utilisateur
  clearAll(userId: string): void {
    const notifications = this.getAllNotifications();
    const filtered = notifications.filter(n => n.userId !== userId);
    this.saveNotifications(filtered);
  }

  // Demander permission notifications navigateur
  async requestBrowserPermission(): Promise<boolean> {
    if (!this.isBrowser || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Afficher notification navigateur
  private showBrowserNotification(notification: Notification): void {
    if (!this.isBrowser || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        tag: notification.id,
        requireInteraction: false
      });

      notif.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
        notif.close();
      };
    }
  }

  // Afficher toast (à connecter avec ToastService)
  private showToast(notification: Notification): void {
    // Cette méthode sera connectée au ToastService existant
    const event = new CustomEvent('notification-toast', {
      detail: notification
    });
    if (this.isBrowser) {
      window.dispatchEvent(event);
    }
  }

  private getAllNotifications(): Notification[] {
    if (!this.isBrowser) return [];
    
    const notifJson = localStorage.getItem('notifications');
    return notifJson ? JSON.parse(notifJson) : [];
  }

  private generateId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}