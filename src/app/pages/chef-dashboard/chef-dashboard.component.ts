// src/app/pages/chef-dashboard/chef-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { ChefDishesService, ChefDish } from '../../services/chef-dishes.service';
import { OrdersService, Order } from '../../services/orders.service';

@Component({
  selector: 'app-chef-dashboard',
  templateUrl: './chef-dashboard.component.html',
  styleUrls: ['./chef-dashboard.component.scss']
})
export class ChefDashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentSection: 'overview' | 'dishes' | 'orders' | 'add-dish' = 'overview';
  
  myDishes: ChefDish[] = [];
  myOrders: Order[] = [];
  
  // Add Dish Form
  newDish = {
    name: '',
    nameEn: '',
    description: '',
    price: 0,
    image: '',
    category: 'attieke' as 'attieke' | 'foutou' | 'alloco' | 'sauce',
    ingredients: [] as string[],
    preparationTime: '',
    servings: 1,
    spicyLevel: 0
  };

  ingredientInput: string = '';
  imagePreview: string = '';
  isSubmitting: boolean = false;

  stats = {
    totalDishes: 0,
    approvedDishes: 0,
    pendingDishes: 0,
    rejectedDishes: 0,
    totalOrders: 0,
    totalRevenue: 0
  };

  constructor(
    private authService: AuthService,
    private chefDishesService: ChefDishesService,
    private ordersService: OrdersService
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

    this.chefDishesService.getChefDishes(this.currentUser.id).subscribe(dishes => {
      this.myDishes = dishes;
      this.calculateStats();
    });

    // TODO: Load orders assigned to this chef
    this.myOrders = [];
  }

  calculateStats(): void {
    this.stats.totalDishes = this.myDishes.length;
    this.stats.approvedDishes = this.myDishes.filter(d => d.approvalStatus === 'approved').length;
    this.stats.pendingDishes = this.myDishes.filter(d => d.approvalStatus === 'pending').length;
    this.stats.rejectedDishes = this.myDishes.filter(d => d.approvalStatus === 'rejected').length;
  }

  changeSection(section: 'overview' | 'dishes' | 'orders' | 'add-dish'): void {
    this.currentSection = section;
  }

  // Add Dish
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
        this.newDish.image = this.imagePreview;
      };

      reader.readAsDataURL(file);
    }
  }

  addIngredient(): void {
    if (this.ingredientInput.trim()) {
      this.newDish.ingredients.push(this.ingredientInput.trim());
      this.ingredientInput = '';
    }
  }

  removeIngredient(index: number): void {
    this.newDish.ingredients.splice(index, 1);
  }

  submitDish(): void {
    if (!this.currentUser) return;

    // Validation
    if (!this.newDish.name || !this.newDish.nameEn || !this.newDish.description || 
        !this.newDish.price || !this.newDish.image) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.newDish.ingredients.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient');
      return;
    }

    this.isSubmitting = true;

    this.chefDishesService.submitDish({
      chefId: this.currentUser.id,
      chefName: this.currentUser.name,
      ...this.newDish
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          alert('Plat soumis avec succès ! Il sera visible après validation par un administrateur.');
          this.resetForm();
          this.loadData();
          this.changeSection('dishes');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        alert('Erreur lors de la soumission du plat');
        console.error(error);
      }
    });
  }

  resetForm(): void {
    this.newDish = {
      name: '',
      nameEn: '',
      description: '',
      price: 0,
      image: '',
      category: 'attieke',
      ingredients: [],
      preparationTime: '',
      servings: 1,
      spicyLevel: 0
    };
    this.imagePreview = '';
    this.ingredientInput = '';
  }

  deleteDish(dishId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;

    this.chefDishesService.deleteDish(dishId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadData();
          alert('Plat supprimé avec succès');
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    return {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger'
    }[status] || '';
  }

  getStatusText(status: string): string {
    return {
      'pending': 'En attente',
      'approved': 'Approuvé',
      'rejected': 'Rejeté'
    }[status] || status;
  }
}