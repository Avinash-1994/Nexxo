import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-179',
  templateUrl: './hero-179.component.html',
  styleUrls: ['./hero-179.component.css']
})
export class Hero179Component {
  @Input() heroId: number = 179;
  name: string = 'Hero 179';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}