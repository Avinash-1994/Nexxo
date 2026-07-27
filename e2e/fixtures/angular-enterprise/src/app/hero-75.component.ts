import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-75',
  templateUrl: './hero-75.component.html',
  styleUrls: ['./hero-75.component.css']
})
export class Hero75Component {
  @Input() heroId: number = 75;
  name: string = 'Hero 75';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}