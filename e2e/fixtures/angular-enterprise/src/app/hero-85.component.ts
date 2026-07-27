import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-85',
  templateUrl: './hero-85.component.html',
  styleUrls: ['./hero-85.component.css']
})
export class Hero85Component {
  @Input() heroId: number = 85;
  name: string = 'Hero 85';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}