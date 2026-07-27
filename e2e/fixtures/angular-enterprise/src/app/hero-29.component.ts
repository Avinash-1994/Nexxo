import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-29',
  templateUrl: './hero-29.component.html',
  styleUrls: ['./hero-29.component.css']
})
export class Hero29Component {
  @Input() heroId: number = 29;
  name: string = 'Hero 29';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}