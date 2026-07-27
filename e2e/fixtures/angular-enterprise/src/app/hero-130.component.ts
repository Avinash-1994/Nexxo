import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-130',
  templateUrl: './hero-130.component.html',
  styleUrls: ['./hero-130.component.css']
})
export class Hero130Component {
  @Input() heroId: number = 130;
  name: string = 'Hero 130';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}