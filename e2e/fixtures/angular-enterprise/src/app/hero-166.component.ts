import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-166',
  templateUrl: './hero-166.component.html',
  styleUrls: ['./hero-166.component.css']
})
export class Hero166Component {
  @Input() heroId: number = 166;
  name: string = 'Hero 166';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}