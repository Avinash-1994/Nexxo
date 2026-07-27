import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-146',
  templateUrl: './hero-146.component.html',
  styleUrls: ['./hero-146.component.css']
})
export class Hero146Component {
  @Input() heroId: number = 146;
  name: string = 'Hero 146';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}