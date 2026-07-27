import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-151',
  templateUrl: './hero-151.component.html',
  styleUrls: ['./hero-151.component.css']
})
export class Hero151Component {
  @Input() heroId: number = 151;
  name: string = 'Hero 151';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}