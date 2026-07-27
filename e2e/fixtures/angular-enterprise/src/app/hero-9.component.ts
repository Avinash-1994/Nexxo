import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-9',
  templateUrl: './hero-9.component.html',
  styleUrls: ['./hero-9.component.css']
})
export class Hero9Component {
  @Input() heroId: number = 9;
  name: string = 'Hero 9';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}