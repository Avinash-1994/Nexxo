import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-145',
  templateUrl: './hero-145.component.html',
  styleUrls: ['./hero-145.component.css']
})
export class Hero145Component {
  @Input() heroId: number = 145;
  name: string = 'Hero 145';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}