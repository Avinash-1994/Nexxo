import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-155',
  templateUrl: './hero-155.component.html',
  styleUrls: ['./hero-155.component.css']
})
export class Hero155Component {
  @Input() heroId: number = 155;
  name: string = 'Hero 155';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}