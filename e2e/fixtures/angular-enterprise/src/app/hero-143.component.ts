import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-143',
  templateUrl: './hero-143.component.html',
  styleUrls: ['./hero-143.component.css']
})
export class Hero143Component {
  @Input() heroId: number = 143;
  name: string = 'Hero 143';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}