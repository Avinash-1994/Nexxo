import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-81',
  templateUrl: './hero-81.component.html',
  styleUrls: ['./hero-81.component.css']
})
export class Hero81Component {
  @Input() heroId: number = 81;
  name: string = 'Hero 81';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}