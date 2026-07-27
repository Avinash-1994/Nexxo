import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-116',
  templateUrl: './hero-116.component.html',
  styleUrls: ['./hero-116.component.css']
})
export class Hero116Component {
  @Input() heroId: number = 116;
  name: string = 'Hero 116';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}