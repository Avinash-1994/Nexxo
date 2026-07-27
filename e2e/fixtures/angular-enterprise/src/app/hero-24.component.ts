import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-24',
  templateUrl: './hero-24.component.html',
  styleUrls: ['./hero-24.component.css']
})
export class Hero24Component {
  @Input() heroId: number = 24;
  name: string = 'Hero 24';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}