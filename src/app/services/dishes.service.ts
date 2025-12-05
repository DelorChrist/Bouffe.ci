// src/app/services/dishes.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Dish {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  price: number;
  image: string;
  category: 'attieke' | 'foutou' | 'alloco' | 'sauce';
  popular: boolean;
  ingredients?: string[];
  preparationTime?: string;
  servings?: number;
  spicyLevel?: number; // 0-5
  nutritionalInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DishesService {
  private dishes: Dish[] = [
    {
      id: 1,
      name: 'Attiéké Poisson',
      nameEn: 'Attieke Fish',
      description: 'Attiéké accompagné de poisson braisé et sauce oignon',
      price: 2000,
      image: 'assets/images/attieke-poisson.jpeg',
      category: 'attieke',
      popular: true,
      ingredients: ['Attiéké (semoule de manioc)', 'Poisson (thon ou capitaine)', 'Oignons', 'Tomates', 'Piment', 'Cube Maggi', 'Huile végétale'],
      preparationTime: '30 min',
      servings: 1,
      spicyLevel: 2,
      nutritionalInfo: {
        calories: 450,
        protein: '35g',
        carbs: '45g',
        fat: '15g'
      }
    },
    {
      id: 2,
      name: 'Placali Sauce Graine',
      nameEn: 'Placali Palm Nut Soup',
      description: 'Placali traditionnel avec sauce graine onctueuse',
      price: 1500,
      image: 'assets/images/placali.jpeg',
      category: 'sauce',
      popular: true,
      ingredients: ['Pâte de manioc fermenté', 'Noix de palme', 'Poisson fumé', 'Viande', 'Aubergines', 'Gombo', 'Piment', 'Sel'],
      preparationTime: '45 min',
      servings: 1,
      spicyLevel: 3,
      nutritionalInfo: {
        calories: 550,
        protein: '28g',
        carbs: '52g',
        fat: '25g'
      }
    },
    {
      id: 3,
      name: 'Foutou Banane',
      nameEn: 'Plantain Foutou',
      description: 'Foutou de banane plantain avec sauce de votre choix',
      price: 1800,
      image: 'assets/images/foutou.jpeg',
      category: 'foutou',
      popular: true,
      ingredients: ['Bananes plantains mûres', 'Eau', 'Sauce arachide ou graine', 'Viande ou poisson', 'Légumes'],
      preparationTime: '40 min',
      servings: 1,
      spicyLevel: 2,
      nutritionalInfo: {
        calories: 480,
        protein: '20g',
        carbs: '65g',
        fat: '18g'
      }
    },
    {
      id: 4,
      name: 'Alloco Poulet',
      nameEn: 'Fried Plantain Chicken',
      description: 'Bananes plantains frites dorées avec poulet braisé',
      price: 1200,
      image: 'assets/images/alloco.jpeg',
      category: 'alloco',
      popular: true,
      ingredients: ['Bananes plantains', 'Huile de friture', 'Poulet', 'Oignons', 'Tomates', 'Piment', 'Ail', 'Gingembre'],
      preparationTime: '25 min',
      servings: 1,
      spicyLevel: 2,
      nutritionalInfo: {
        calories: 520,
        protein: '30g',
        carbs: '48g',
        fat: '22g'
      }
    },
    {
      id: 5,
      name: 'Attiéké Poulet',
      nameEn: 'Attieke Chicken',
      description: 'Attiéké avec poulet braisé croustillant',
      price: 1800,
      image: 'assets/images/attieke-poulet1.jpeg',
      category: 'attieke',
      popular: false,
      ingredients: ['Attiéké', 'Poulet fermier', 'Sauce oignon', 'Tomates', 'Piment', 'Épices', 'Huile'],
      preparationTime: '35 min',
      servings: 1,
      spicyLevel: 2,
      nutritionalInfo: {
        calories: 470,
        protein: '32g',
        carbs: '42g',
        fat: '18g'
      }
    },
    {
      id: 6,
      name: 'Foutou Igname',
      nameEn: 'Yam Foutou',
      description: 'Foutou d\'igname traditionnel',
      price: 2000,
      image: 'assets/images/foutou-igname.jpeg',
      category: 'foutou',
      popular: false,
      ingredients: ['Igname', 'Eau', 'Sauce graine ou claire', 'Poisson fumé', 'Viande', 'Légumes verts'],
      preparationTime: '50 min',
      servings: 1,
      spicyLevel: 3,
      nutritionalInfo: {
        calories: 500,
        protein: '22g',
        carbs: '70g',
        fat: '16g'
      }
    },
    {
      id: 7,
      name: 'Sauce Claire',
      nameEn: 'Light Sauce',
      description: 'Sauce claire avec poisson fumé',
      price: 1500,
      image: 'assets/images/sauce-claire.jpeg',
      category: 'sauce',
      popular: false,
      ingredients: ['Poisson fumé', 'Tomates fraîches', 'Oignons', 'Piment', 'Gombo', 'Aubergines', 'Huile de palme', 'Cube Maggi'],
      preparationTime: '35 min',
      servings: 1,
      spicyLevel: 4,
      nutritionalInfo: {
        calories: 380,
        protein: '25g',
        carbs: '28g',
        fat: '20g'
      }
    },
    {
      id: 8,
      name: 'Foutou Manioc',
      nameEn: 'Cassava Foutou',
      description: 'Manioc pilé avec une sauce très épicée',
      price: 800,
      image: 'assets/images/manioc.jpeg',
      category: 'foutou',
      popular: false,
      ingredients: ['Manioc', 'Eau', 'Sauce piment', 'Poisson', 'Aubergines', 'Piment frais', 'Oignons'],
      preparationTime: '45 min',
      servings: 1,
      spicyLevel: 5,
      nutritionalInfo: {
        calories: 420,
        protein: '18g',
        carbs: '62g',
        fat: '14g'
      }
    }
  ];

  private dishesSubject = new BehaviorSubject<Dish[]>(this.dishes);
  
  constructor() {}

  getAllDishes(): Observable<Dish[]> {
    return this.dishesSubject.asObservable();
  }

  getPopularDishes(): Observable<Dish[]> {
    const popular = this.dishes.filter(dish => dish.popular);
    return new BehaviorSubject<Dish[]>(popular).asObservable();
  }

  getDishesByCategory(category: string): Observable<Dish[]> {
    const filtered = this.dishes.filter(dish => dish.category === category);
    return new BehaviorSubject<Dish[]>(filtered).asObservable();
  }

  getDishById(id: number): Dish | undefined {
    return this.dishes.find(dish => dish.id === id);
  }

  searchDishes(query: string): Observable<Dish[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.dishes.filter(dish =>
      dish.name.toLowerCase().includes(lowerQuery) ||
      dish.nameEn.toLowerCase().includes(lowerQuery) ||
      dish.description.toLowerCase().includes(lowerQuery) ||
      dish.ingredients?.some(ing => ing.toLowerCase().includes(lowerQuery))
    );
    return new BehaviorSubject<Dish[]>(filtered).asObservable();
  }
}