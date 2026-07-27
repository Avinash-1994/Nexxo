import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-170',
  templateUrl: './hero-170.component.html',
  styleUrls: ['./hero-170.component.css']
})
export class Hero170Component {
  @Input() heroId: number = 170;
  name: string = 'Hero 170';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}