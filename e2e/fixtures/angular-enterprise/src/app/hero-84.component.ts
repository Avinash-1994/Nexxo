import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-84',
  templateUrl: './hero-84.component.html',
  styleUrls: ['./hero-84.component.css']
})
export class Hero84Component {
  @Input() heroId: number = 84;
  name: string = 'Hero 84';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}