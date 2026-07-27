import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-121',
  templateUrl: './hero-121.component.html',
  styleUrls: ['./hero-121.component.css']
})
export class Hero121Component {
  @Input() heroId: number = 121;
  name: string = 'Hero 121';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}