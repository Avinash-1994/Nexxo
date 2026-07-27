import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-131',
  templateUrl: './hero-131.component.html',
  styleUrls: ['./hero-131.component.css']
})
export class Hero131Component {
  @Input() heroId: number = 131;
  name: string = 'Hero 131';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}