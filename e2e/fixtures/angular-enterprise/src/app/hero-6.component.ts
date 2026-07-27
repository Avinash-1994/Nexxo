import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-6',
  templateUrl: './hero-6.component.html',
  styleUrls: ['./hero-6.component.css']
})
export class Hero6Component {
  @Input() heroId: number = 6;
  name: string = 'Hero 6';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}