import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-82',
  templateUrl: './hero-82.component.html',
  styleUrls: ['./hero-82.component.css']
})
export class Hero82Component {
  @Input() heroId: number = 82;
  name: string = 'Hero 82';
  
  powerLevel(): number {
    return this.heroId * 1000;
  }
}