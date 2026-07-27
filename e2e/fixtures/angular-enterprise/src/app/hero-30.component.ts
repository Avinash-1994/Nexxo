import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-30',
  templateUrl: './hero-30.component.html',
  styleUrls: ['./hero-30.component.css']
})
export class Hero30Component {
  @Input() heroId: number = 30;
  name: string = 'Hero 30';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}