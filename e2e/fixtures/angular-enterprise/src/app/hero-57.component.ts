import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-57',
  templateUrl: './hero-57.component.html',
  styleUrls: ['./hero-57.component.css']
})
export class Hero57Component {
  @Input() heroId: number = 57;
  name: string = 'Hero 57';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}