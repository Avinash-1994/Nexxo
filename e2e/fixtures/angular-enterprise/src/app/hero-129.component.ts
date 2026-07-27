import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-129',
  templateUrl: './hero-129.component.html',
  styleUrls: ['./hero-129.component.css']
})
export class Hero129Component {
  @Input() heroId: number = 129;
  name: string = 'Hero 129';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}