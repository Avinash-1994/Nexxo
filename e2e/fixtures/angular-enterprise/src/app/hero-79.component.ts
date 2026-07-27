import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-79',
  templateUrl: './hero-79.component.html',
  styleUrls: ['./hero-79.component.css']
})
export class Hero79Component {
  @Input() heroId: number = 79;
  name: string = 'Hero 79';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}