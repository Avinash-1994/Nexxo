import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-43',
  templateUrl: './hero-43.component.html',
  styleUrls: ['./hero-43.component.css']
})
export class Hero43Component {
  @Input() heroId: number = 43;
  name: string = 'Hero 43';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}