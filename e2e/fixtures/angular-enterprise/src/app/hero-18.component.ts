import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-18',
  templateUrl: './hero-18.component.html',
  styleUrls: ['./hero-18.component.css']
})
export class Hero18Component {
  @Input() heroId: number = 18;
  name: string = 'Hero 18';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}