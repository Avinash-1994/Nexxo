import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-17',
  templateUrl: './hero-17.component.html',
  styleUrls: ['./hero-17.component.css']
})
export class Hero17Component {
  @Input() heroId: number = 17;
  name: string = 'Hero 17';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}