import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-31',
  templateUrl: './hero-31.component.html',
  styleUrls: ['./hero-31.component.css']
})
export class Hero31Component {
  @Input() heroId: number = 31;
  name: string = 'Hero 31';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}