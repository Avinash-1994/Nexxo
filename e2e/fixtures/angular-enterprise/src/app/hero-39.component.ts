import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-39',
  templateUrl: './hero-39.component.html',
  styleUrls: ['./hero-39.component.css']
})
export class Hero39Component {
  @Input() heroId: number = 39;
  name: string = 'Hero 39';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}