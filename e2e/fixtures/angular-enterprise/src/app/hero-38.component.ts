import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-38',
  templateUrl: './hero-38.component.html',
  styleUrls: ['./hero-38.component.css']
})
export class Hero38Component {
  @Input() heroId: number = 38;
  name: string = 'Hero 38';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}