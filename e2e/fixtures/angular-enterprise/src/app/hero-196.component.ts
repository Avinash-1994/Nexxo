import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-196',
  templateUrl: './hero-196.component.html',
  styleUrls: ['./hero-196.component.css']
})
export class Hero196Component {
  @Input() heroId: number = 196;
  name: string = 'Hero 196';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}