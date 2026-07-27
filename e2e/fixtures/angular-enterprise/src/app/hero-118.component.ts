import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-118',
  templateUrl: './hero-118.component.html',
  styleUrls: ['./hero-118.component.css']
})
export class Hero118Component {
  @Input() heroId: number = 118;
  name: string = 'Hero 118';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}