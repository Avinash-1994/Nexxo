import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-69',
  templateUrl: './hero-69.component.html',
  styleUrls: ['./hero-69.component.css']
})
export class Hero69Component {
  @Input() heroId: number = 69;
  name: string = 'Hero 69';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}