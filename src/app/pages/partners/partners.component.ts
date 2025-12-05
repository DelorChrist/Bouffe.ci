// src/app/pages/partners/partners.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface PartnerType {
  id: string;
  title: string;
  icon: string;
  description: string;
  benefits: string[];
  requirements: string[];
}

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent {
  selectedPartnerType: string = '';

  partnerTypes: PartnerType[] = [
    {
      id: 'chef',
      title: 'Cuisinier',
      icon: '👨‍🍳',
      description: 'Partagez votre passion culinaire et vos recettes traditionnelles',
      benefits: [
        'Revenus supplémentaires flexibles',
        'Accès à une large clientèle',
        'Formation et accompagnement',
        'Liberté de gérer votre menu',
        'Paiements sécurisés et rapides'
      ],
      requirements: [
        'Passion pour la cuisine ivoirienne',
        'Respect des normes d\'hygiène',
        'Disponibilité régulière',
        'Capacité de production'
      ]
    },
    {
      id: 'delivery',
      title: 'Livreur',
      icon: '🏍️',
      description: 'Rejoignez notre équipe de livreurs et gagnez en toute flexibilité',
      benefits: [
        'Horaires flexibles',
        'Rémunération attractive',
        'Pourboires en plus',
        'Assurance incluse',
        'Application simple à utiliser'
      ],
      requirements: [
        'Permis de conduire valide',
        'Véhicule en bon état (moto/voiture)',
        'Smartphone Android ou iOS',
        'Sens du service client'
      ]
    },
    {
      id: 'restaurant',
      title: 'Restaurant Partenaire',
      icon: '🏪',
      description: 'Développez votre activité avec notre plateforme de livraison',
      benefits: [
        'Visibilité accrue',
        'Augmentation du chiffre d\'affaires',
        'Gestion simplifiée des commandes',
        'Marketing et promotion',
        'Support technique dédié'
      ],
      requirements: [
        'Restaurant enregistré légalement',
        'Respect des normes sanitaires',
        'Capacité de livraison',
        'Menu diversifié'
      ]
    }
  ];

  // Formulaire
  applicationForm = {
    partnerType: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    message: ''
  };

  isSubmitting = false;
  showSuccessMessage = false;

  constructor(private router: Router) {}

  selectPartnerType(type: string): void {
    this.selectedPartnerType = type;
    this.applicationForm.partnerType = type;
    
    // Scroll vers le formulaire
    setTimeout(() => {
      const formElement = document.querySelector('.application-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  submitApplication(): void {
    // Validation
    if (!this.applicationForm.name || !this.applicationForm.email || 
        !this.applicationForm.phone || !this.applicationForm.partnerType) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;

    // Simulation d'envoi (remplacer par vraie API)
    setTimeout(() => {
      this.isSubmitting = false;
      this.showSuccessMessage = true;
      
      // Réinitialiser le formulaire
      this.applicationForm = {
        partnerType: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        experience: '',
        message: ''
      };
      this.selectedPartnerType = '';

      // Cacher le message après 5 secondes
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);
    }, 2000);
  }

  getSelectedPartner(): PartnerType | undefined {
    return this.partnerTypes.find(p => p.id === this.selectedPartnerType);
  }
}