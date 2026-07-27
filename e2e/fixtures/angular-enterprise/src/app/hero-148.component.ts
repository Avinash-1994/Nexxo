import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-148',
  templateUrl: './hero-148.component.html',
  styleUrls: ['./hero-148.component.css']
})
export class Hero148Component {
  @Input() heroId: number = 148;
  name: string = 'Hero 148';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}