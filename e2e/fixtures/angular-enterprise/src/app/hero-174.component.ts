import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-174',
  templateUrl: './hero-174.component.html',
  styleUrls: ['./hero-174.component.css']
})
export class Hero174Component {
  @Input() heroId: number = 174;
  name: string = 'Hero 174';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}