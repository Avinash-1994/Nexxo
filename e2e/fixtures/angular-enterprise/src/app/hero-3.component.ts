import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-3',
  templateUrl: './hero-3.component.html',
  styleUrls: ['./hero-3.component.css']
})
export class Hero3Component {
  @Input() heroId: number = 3;
  name: string = 'Hero 3';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}