// src/app/services/reviews.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetType: 'dish' | 'livreur';
  targetId: string | number; // dishId ou livreurId
  orderId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[]; // Photos du plat livré
  createdAt: Date;
  helpful: number; // Nombre de "utile"
  response?: {
    text: string;
    date: Date;
    responderId: string;
  };
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadReviews();
  }

  private loadReviews(): void {
    if (this.isBrowser) {
      const reviewsJson = localStorage.getItem('reviews');
      const reviews = reviewsJson ? JSON.parse(reviewsJson) : [];
      this.reviewsSubject.next(reviews);
    }
  }

  private saveReviews(reviews: Review[]): void {
    if (this.isBrowser) {
      localStorage.setItem('reviews', JSON.stringify(reviews));
      this.reviewsSubject.next(reviews);
    }
  }

  // Créer un avis
  createReview(review: Omit<Review, 'id' | 'createdAt' | 'helpful'>): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Vérifier si l'utilisateur a déjà noté
      const existing = this.getAllReviews().find(
        r => r.userId === review.userId && 
             r.orderId === review.orderId &&
             r.targetType === review.targetType &&
             r.targetId === review.targetId
      );

      if (existing) {
        observer.next({ 
          success: false, 
          message: 'Vous avez déjà noté cet élément pour cette commande' 
        });
        observer.complete();
        return;
      }

      // Validation
      if (review.rating < 1 || review.rating > 5) {
        observer.next({ success: false, message: 'La note doit être entre 1 et 5' });
        observer.complete();
        return;
      }

      const newReview: Review = {
        ...review,
        id: this.generateId(),
        createdAt: new Date(),
        helpful: 0
      };

      const reviews = this.getAllReviews();
      reviews.unshift(newReview);
      this.saveReviews(reviews);

      observer.next({ 
        success: true, 
        message: 'Merci pour votre avis !' 
      });
      observer.complete();
    });
  }

  // Récupérer les avis d'un plat
  getDishReviews(dishId: number): Observable<Review[]> {
    return new Observable(observer => {
      const reviews = this.getAllReviews()
        .filter(r => r.targetType === 'dish' && r.targetId === dishId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      observer.next(reviews);
      observer.complete();
    });
  }

  // Récupérer les avis d'un livreur
  getLivreurReviews(livreurId: string): Observable<Review[]> {
    return new Observable(observer => {
      const reviews = this.getAllReviews()
        .filter(r => r.targetType === 'livreur' && r.targetId === livreurId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      observer.next(reviews);
      observer.complete();
    });
  }

  // Statistiques de notation d'un plat
  getDishRatingStats(dishId: number): RatingStats {
    const reviews = this.getAllReviews().filter(
      r => r.targetType === 'dish' && r.targetId === dishId
    );

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      averageRating: parseFloat((totalRating / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
      distribution
    };
  }

  // Statistiques de notation d'un livreur
  getLivreurRatingStats(livreurId: string): RatingStats {
    const reviews = this.getAllReviews().filter(
      r => r.targetType === 'livreur' && r.targetId === livreurId
    );

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      totalRating += review.rating;
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      averageRating: parseFloat((totalRating / reviews.length).toFixed(1)),
      totalReviews: reviews.length,
      distribution
    };
  }

  // Vérifier si l'utilisateur peut noter (commande livrée)
  canReview(userId: string, orderId: string, targetType: 'dish' | 'livreur', targetId: string | number): boolean {
    const existing = this.getAllReviews().find(
      r => r.userId === userId && 
           r.orderId === orderId &&
           r.targetType === targetType &&
           r.targetId === targetId
    );

    return !existing; // Peut noter si pas déjà fait
  }

  // Marquer un avis comme utile
  markAsHelpful(reviewId: string): void {
    const reviews = this.getAllReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
      review.helpful++;
      this.saveReviews(reviews);
    }
  }

  // Répondre à un avis (pour chef ou admin)
  respondToReview(reviewId: string, responseText: string, responderId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const reviews = this.getAllReviews();
      const review = reviews.find(r => r.id === reviewId);
      
      if (!review) {
        observer.next({ success: false, message: 'Avis introuvable' });
        observer.complete();
        return;
      }

      if (review.response) {
        observer.next({ success: false, message: 'Vous avez déjà répondu à cet avis' });
        observer.complete();
        return;
      }

      review.response = {
        text: responseText,
        date: new Date(),
        responderId
      };

      this.saveReviews(reviews);

      observer.next({ 
        success: true, 
        message: 'Réponse publiée avec succès' 
      });
      observer.complete();
    });
  }

  // Supprimer un avis (admin uniquement)
  deleteReview(reviewId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const reviews = this.getAllReviews();
      const filtered = reviews.filter(r => r.id !== reviewId);
      
      if (filtered.length === reviews.length) {
        observer.next({ success: false, message: 'Avis introuvable' });
      } else {
        this.saveReviews(filtered);
        observer.next({ success: true, message: 'Avis supprimé' });
      }
      
      observer.complete();
    });
  }

  // Récupérer les avis récents
  getRecentReviews(limit: number = 10): Review[] {
    return this.getAllReviews()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  // Récupérer les meilleurs avis
  getTopReviews(limit: number = 10): Review[] {
    return this.getAllReviews()
      .filter(r => r.rating >= 4)
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  }

  private getAllReviews(): Review[] {
    if (!this.isBrowser) return [];
    
    const reviewsJson = localStorage.getItem('reviews');
    return reviewsJson ? JSON.parse(reviewsJson) : [];
  }

  private generateId(): string {
    return 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}