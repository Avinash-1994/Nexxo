import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-47',
  templateUrl: './hero-47.component.html',
  styleUrls: ['./hero-47.component.css']
})
export class Hero47Component {
  @Input() heroId: number = 47;
  name: string = 'Hero 47';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}