import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { OrdersService, Order } from '../../services/orders.service';
import { ChefDishesService, ChefDish } from '../../services/chef-dishes.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentSection: 'overview' | 'users' | 'dishes' | 'orders' = 'overview';

  // Users
  pendingChefs: User[] = [];
  pendingLivreurs: User[] = [];
  allUsers: User[] = [];

  // Dishes
  pendingDishes: ChefDish[] = [];

  // Orders
  allOrders: Order[] = [];
  activeOrders: Order[] = [];

  // Stats
  stats = {
    totalUsers: 0,
    totalChefs: 0,
    totalLivreurs: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayOrders: 0
  };

  selectedUser: User | null = null;
  selectedDish: ChefDish | null = null;
  rejectionReason: string = '';

  constructor(
    public authService: AuthService,
    public ordersService: OrdersService,
    public chefDishesService: ChefDishesService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadUsers();
    this.loadDishes();
    this.loadOrders();
    this.calculateStats();
  }

  loadUsers(): void {
    this.allUsers = this.authService.getAllUsers().filter(u => u.role !== 'admin');
    this.pendingChefs = this.allUsers.filter(u => u.role === 'chef' && u.status === 'pending');
    this.pendingLivreurs = this.allUsers.filter(u => u.role === 'livreur' && u.status === 'pending');
  }

  loadDishes(): void {
    this.pendingDishes = this.chefDishesService.getPendingDishes();
  }

  loadOrders(): void {
    this.allOrders = this.ordersService.getAllOrders() || [];
    this.activeOrders = this.allOrders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  }

  calculateStats(): void {
    this.stats.totalUsers = this.allUsers.filter(u => u.role === 'user').length;
    this.stats.totalChefs = this.allUsers.filter(u => u.role === 'chef' && u.status === 'approved').length;
    this.stats.totalLivreurs = this.allUsers.filter(u => u.role === 'livreur' && u.status === 'approved').length;
    this.stats.totalOrders = this.allOrders.length;
    this.stats.pendingOrders = this.allOrders.filter(o => o.status === 'pending').length;
    this.stats.totalRevenue = this.allOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.stats.todayOrders = this.allOrders.filter(o => new Date(o.createdAt) >= today).length;
  }

  changeSection(section: 'overview' | 'users' | 'dishes' | 'orders'): void {
    this.currentSection = section;
  }

  // User Management
  viewUser(user: User): void {
    this.selectedUser = user;
  }

  approveUser(userId: string): void {
    const users = this.authService.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].status = 'approved';
      localStorage.setItem('users', JSON.stringify(users));
      this.loadUsers();
      this.selectedUser = null;
      alert('Utilisateur approuvé avec succès');
    }
  }

  rejectUser(userId: string): void {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cet utilisateur ?')) return;

    const users = this.authService.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].status = 'rejected';
      localStorage.setItem('users', JSON.stringify(users));
      this.loadUsers();
      this.selectedUser = null;
      alert('Utilisateur rejeté');
    }
  }

  // Dish Management
  viewDish(dish: ChefDish): void {
    this.selectedDish = dish;
  }

  approveDish(dishId: number): void {
    this.chefDishesService.approveDish(dishId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDishes();
          this.selectedDish = null;
          alert('Plat approuvé et ajouté au menu');
        }
      }
    });
  }

  rejectDish(dishId: number): void {
    if (!this.rejectionReason.trim()) {
      alert('Veuillez indiquer la raison du rejet');
      return;
    }

    this.chefDishesService.rejectDish(dishId, this.rejectionReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDishes();
          this.selectedDish = null;
          this.rejectionReason = '';
          alert('Plat rejeté');
        }
      }
    });
  }

  closeModal(): void {
    this.selectedUser = null;
    this.selectedDish = null;
    this.rejectionReason = '';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusBadgeClass(status: string): string {
    return {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger'
    }[status] || '';
  }

  getDocument(doc?: string): string {
    return doc ?? ''; // retourne une chaîne vide si doc est undefined
  }
}
