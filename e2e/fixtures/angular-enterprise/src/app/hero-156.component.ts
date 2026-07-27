import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-156',
  templateUrl: './hero-156.component.html',
  styleUrls: ['./hero-156.component.css']
})
export class Hero156Component {
  @Input() heroId: number = 156;
  name: string = 'Hero 156';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}