import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-13',
  templateUrl: './hero-13.component.html',
  styleUrls: ['./hero-13.component.css']
})
export class Hero13Component {
  @Input() heroId: number = 13;
  name: string = 'Hero 13';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}