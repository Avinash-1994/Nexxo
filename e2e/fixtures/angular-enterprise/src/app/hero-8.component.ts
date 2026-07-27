import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-8',
  templateUrl: './hero-8.component.html',
  styleUrls: ['./hero-8.component.css']
})
export class Hero8Component {
  @Input() heroId: number = 8;
  name: string = 'Hero 8';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}