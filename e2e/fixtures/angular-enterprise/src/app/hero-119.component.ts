import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-119',
  templateUrl: './hero-119.component.html',
  styleUrls: ['./hero-119.component.css']
})
export class Hero119Component {
  @Input() heroId: number = 119;
  name: string = 'Hero 119';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}