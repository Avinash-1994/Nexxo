import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-98',
  templateUrl: './hero-98.component.html',
  styleUrls: ['./hero-98.component.css']
})
export class Hero98Component {
  @Input() heroId: number = 98;
  name: string = 'Hero 98';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}