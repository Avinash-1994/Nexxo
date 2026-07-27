import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-187',
  templateUrl: './hero-187.component.html',
  styleUrls: ['./hero-187.component.css']
})
export class Hero187Component {
  @Input() heroId: number = 187;
  name: string = 'Hero 187';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}