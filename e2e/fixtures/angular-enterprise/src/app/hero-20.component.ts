import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-20',
  templateUrl: './hero-20.component.html',
  styleUrls: ['./hero-20.component.css']
})
export class Hero20Component {
  @Input() heroId: number = 20;
  name: string = 'Hero 20';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}