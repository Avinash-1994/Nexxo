import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-199',
  templateUrl: './hero-199.component.html',
  styleUrls: ['./hero-199.component.css']
})
export class Hero199Component {
  @Input() heroId: number = 199;
  name: string = 'Hero 199';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}