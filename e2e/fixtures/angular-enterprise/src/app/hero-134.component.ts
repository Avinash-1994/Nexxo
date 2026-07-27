import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-134',
  templateUrl: './hero-134.component.html',
  styleUrls: ['./hero-134.component.css']
})
export class Hero134Component {
  @Input() heroId: number = 134;
  name: string = 'Hero 134';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}