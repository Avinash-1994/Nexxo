import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-23',
  templateUrl: './hero-23.component.html',
  styleUrls: ['./hero-23.component.css']
})
export class Hero23Component {
  @Input() heroId: number = 23;
  name: string = 'Hero 23';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}