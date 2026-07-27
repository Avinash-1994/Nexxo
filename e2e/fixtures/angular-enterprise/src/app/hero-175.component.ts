import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-175',
  templateUrl: './hero-175.component.html',
  styleUrls: ['./hero-175.component.css']
})
export class Hero175Component {
  @Input() heroId: number = 175;
  name: string = 'Hero 175';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}