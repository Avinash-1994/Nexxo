import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-144',
  templateUrl: './hero-144.component.html',
  styleUrls: ['./hero-144.component.css']
})
export class Hero144Component {
  @Input() heroId: number = 144;
  name: string = 'Hero 144';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}