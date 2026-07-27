import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-158',
  templateUrl: './hero-158.component.html',
  styleUrls: ['./hero-158.component.css']
})
export class Hero158Component {
  @Input() heroId: number = 158;
  name: string = 'Hero 158';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}