import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-48',
  templateUrl: './hero-48.component.html',
  styleUrls: ['./hero-48.component.css']
})
export class Hero48Component {
  @Input() heroId: number = 48;
  name: string = 'Hero 48';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}