import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-44',
  templateUrl: './hero-44.component.html',
  styleUrls: ['./hero-44.component.css']
})
export class Hero44Component {
  @Input() heroId: number = 44;
  name: string = 'Hero 44';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}