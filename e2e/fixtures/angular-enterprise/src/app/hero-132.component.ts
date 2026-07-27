import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-132',
  templateUrl: './hero-132.component.html',
  styleUrls: ['./hero-132.component.css']
})
export class Hero132Component {
  @Input() heroId: number = 132;
  name: string = 'Hero 132';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}