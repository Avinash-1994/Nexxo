import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-198',
  templateUrl: './hero-198.component.html',
  styleUrls: ['./hero-198.component.css']
})
export class Hero198Component {
  @Input() heroId: number = 198;
  name: string = 'Hero 198';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}