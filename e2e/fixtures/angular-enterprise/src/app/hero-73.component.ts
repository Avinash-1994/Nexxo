import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-73',
  templateUrl: './hero-73.component.html',
  styleUrls: ['./hero-73.component.css']
})
export class Hero73Component {
  @Input() heroId: number = 73;
  name: string = 'Hero 73';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}