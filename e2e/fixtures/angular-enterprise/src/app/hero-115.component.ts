import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-115',
  templateUrl: './hero-115.component.html',
  styleUrls: ['./hero-115.component.css']
})
export class Hero115Component {
  @Input() heroId: number = 115;
  name: string = 'Hero 115';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}