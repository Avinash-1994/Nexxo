import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-5',
  templateUrl: './hero-5.component.html',
  styleUrls: ['./hero-5.component.css']
})
export class Hero5Component {
  @Input() heroId: number = 5;
  name: string = 'Hero 5';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}