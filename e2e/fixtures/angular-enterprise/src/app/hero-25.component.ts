import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-25',
  templateUrl: './hero-25.component.html',
  styleUrls: ['./hero-25.component.css']
})
export class Hero25Component {
  @Input() heroId: number = 25;
  name: string = 'Hero 25';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}