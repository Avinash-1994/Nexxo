import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-86',
  templateUrl: './hero-86.component.html',
  styleUrls: ['./hero-86.component.css']
})
export class Hero86Component {
  @Input() heroId: number = 86;
  name: string = 'Hero 86';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}