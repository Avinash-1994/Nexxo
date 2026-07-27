import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-50',
  templateUrl: './hero-50.component.html',
  styleUrls: ['./hero-50.component.css']
})
export class Hero50Component {
  @Input() heroId: number = 50;
  name: string = 'Hero 50';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}