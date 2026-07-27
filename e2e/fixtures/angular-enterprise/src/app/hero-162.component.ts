import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-162',
  templateUrl: './hero-162.component.html',
  styleUrls: ['./hero-162.component.css']
})
export class Hero162Component {
  @Input() heroId: number = 162;
  name: string = 'Hero 162';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}