import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-64',
  templateUrl: './hero-64.component.html',
  styleUrls: ['./hero-64.component.css']
})
export class Hero64Component {
  @Input() heroId: number = 64;
  name: string = 'Hero 64';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}