import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-164',
  templateUrl: './hero-164.component.html',
  styleUrls: ['./hero-164.component.css']
})
export class Hero164Component {
  @Input() heroId: number = 164;
  name: string = 'Hero 164';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}