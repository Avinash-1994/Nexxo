import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-92',
  templateUrl: './hero-92.component.html',
  styleUrls: ['./hero-92.component.css']
})
export class Hero92Component {
  @Input() heroId: number = 92;
  name: string = 'Hero 92';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}