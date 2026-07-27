import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-71',
  templateUrl: './hero-71.component.html',
  styleUrls: ['./hero-71.component.css']
})
export class Hero71Component {
  @Input() heroId: number = 71;
  name: string = 'Hero 71';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}