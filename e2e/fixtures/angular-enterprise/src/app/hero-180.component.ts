import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-180',
  templateUrl: './hero-180.component.html',
  styleUrls: ['./hero-180.component.css']
})
export class Hero180Component {
  @Input() heroId: number = 180;
  name: string = 'Hero 180';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}