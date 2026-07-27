import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-171',
  templateUrl: './hero-171.component.html',
  styleUrls: ['./hero-171.component.css']
})
export class Hero171Component {
  @Input() heroId: number = 171;
  name: string = 'Hero 171';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}