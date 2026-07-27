import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-105',
  templateUrl: './hero-105.component.html',
  styleUrls: ['./hero-105.component.css']
})
export class Hero105Component {
  @Input() heroId: number = 105;
  name: string = 'Hero 105';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}