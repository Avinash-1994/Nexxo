import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-63',
  templateUrl: './hero-63.component.html',
  styleUrls: ['./hero-63.component.css']
})
export class Hero63Component {
  @Input() heroId: number = 63;
  name: string = 'Hero 63';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}