// src/app/components/loading/loading.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() message: string = 'Chargement...';
  @Input() fullScreen: boolean = false;
}