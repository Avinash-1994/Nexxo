import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-120',
  templateUrl: './hero-120.component.html',
  styleUrls: ['./hero-120.component.css']
})
export class Hero120Component {
  @Input() heroId: number = 120;
  name: string = 'Hero 120';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}