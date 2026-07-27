import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-100',
  templateUrl: './hero-100.component.html',
  styleUrls: ['./hero-100.component.css']
})
export class Hero100Component {
  @Input() heroId: number = 100;
  name: string = 'Hero 100';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}