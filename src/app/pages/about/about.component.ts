// src/app/pages/about/about.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  stats = [
    { icon: '🍽️', value: '500+', label: 'Plats servis par jour' },
    { icon: '⭐', value: '4.8/5', label: 'Note moyenne' },
    { icon: '🚚', value: '30min', label: 'Délai de livraison' },
    { icon: '👨‍🍳', value: '10+', label: 'Années d\'expérience' }
  ];

  values = [
    {
      icon: '🌿',
      title: 'Ingrédients frais',
      description: 'Nous utilisons uniquement des produits locaux et frais pour garantir la qualité de nos plats.'
    },
    {
      icon: '👵',
      title: 'Recettes traditionnelles',
      description: 'Nos recettes sont transmises de génération en génération pour préserver l\'authenticité.'
    },
    {
      icon: '❤️',
      title: 'Fait avec amour',
      description: 'Chaque plat est préparé avec passion et dévouement par notre équipe.'
    },
    {
      icon: '🌍',
      title: 'Engagement local',
      description: 'Nous soutenons les producteurs locaux et valorisons le patrimoine culinaire ivoirien.'
    }
  ];
}