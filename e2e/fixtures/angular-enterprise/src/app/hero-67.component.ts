import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-67',
  templateUrl: './hero-67.component.html',
  styleUrls: ['./hero-67.component.css']
})
export class Hero67Component {
  @Input() heroId: number = 67;
  name: string = 'Hero 67';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}