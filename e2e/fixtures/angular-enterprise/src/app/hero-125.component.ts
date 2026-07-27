import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-125',
  templateUrl: './hero-125.component.html',
  styleUrls: ['./hero-125.component.css']
})
export class Hero125Component {
  @Input() heroId: number = 125;
  name: string = 'Hero 125';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}