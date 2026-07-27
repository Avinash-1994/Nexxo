import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-90',
  templateUrl: './hero-90.component.html',
  styleUrls: ['./hero-90.component.css']
})
export class Hero90Component {
  @Input() heroId: number = 90;
  name: string = 'Hero 90';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}